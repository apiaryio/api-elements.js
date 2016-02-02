// The main Swagger parsing component that outputs refract.

import _ from 'lodash';
import Ast from './ast';
import buildUriTemplate from './uri-template';
import SwaggerParser from 'swagger-parser';
import yaml from 'js-yaml';

// These describe the type of annotations that are produced by this parser
// and assigns a unique code to each one. Downstream applications can use this
// code to group similar types of annotations together.
const ANNOTATIONS = {
  CANNOT_PARSE: {
    type: 'error',
    code: 1,
    fragment: 'yaml-parser',
  },
  AST_UNAVAILABLE: {
    type: 'warning',
    code: 2,
    fragment: 'yaml-parser',
  },
  DATA_LOST: {
    type: 'warning',
    code: 3,
    fragment: 'refract-not-supported',
  },
  VALIDATION_ERROR: {
    type: 'error',
    code: 4,
    fragment: 'swagger-validation',
  },
};

// Test whether a key is a special Swagger extension.
function isExtension(value, key) {
  return key.indexOf('x-') === 0;
}

// The parser holds state about the current parsing environment and converts
// the input Swagger into Refract elements. The `parse` function is its main
// interface.
export default class Parser {
  constructor({minim, source, generateSourceMap}) {
    // Parser options
    this.minim = minim;
    this.source = source;
    this.generateSourceMap = generateSourceMap;

    // Loaded, dereferenced Swagger API
    this.swagger = null;
    // Refract parse result
    this.result = null;
    // Refract API category
    this.api = null;
    // State of the current parsing path
    this.path = [];
    // Current resource group, if any
    this.group = null;
  }

  parse(done) {
    const {
      Category, ParseResult, SourceMap,
    } = this.minim.elements;
    const swaggerParser = new SwaggerParser();

    this.result = new ParseResult();

    // First, we load the YAML if it is a string, and handle any errors.
    let loaded;
    try {
      loaded = _.isString(this.source) ? yaml.safeLoad(this.source) : this.source;
    } catch (err) {
      this.createAnnotation(ANNOTATIONS.CANNOT_PARSE, null,
        (err.reason || 'Problem loading the input'));

      if (err.mark) {
        this.result.first().attributes.set('sourceMap', [
          new SourceMap([[err.mark.position, 1]]),
        ]);
      }

      return done(new Error(err.message), this.result);
    }

    // Some sane defaults since these are sometimes left out completely
    if (loaded.info === undefined) {
      loaded.info = {};
    }

    if (loaded.paths === undefined) {
      loaded.paths = {};
    }

    // Next, we dereference and validate the loaded Swagger object. Any schema
    // violations get converted into annotations with source maps.
    swaggerParser.validate(loaded, (err) => {
      const swagger = swaggerParser.api;
      this.swagger = swaggerParser.api;

      if (err) {
        if (this.swagger === undefined) {
          return done(err, this.result);
        }

        // Non-fatal errors, so let us try and create annotations for them and
        // continue with the parsing as best we can.
        if (err.details) {
          const queue = [err.details];
          while (queue.length) {
            for (const item of queue[0]) {
              this.createAnnotation(ANNOTATIONS.VALIDATION_ERROR, item.path,
                item.message);

              if (item.inner) {
                // TODO: I am honestly not sure what the correct behavior is
                // here. Some items will have within them a tree of other items,
                // some of which might contain more info (but it's unclear).
                // Do we treat them as their own error or do something else?
                queue.push(item.inner);
              }
            }
            queue.shift();
          }

          return done(new Error(err.message), this.result);
        }

        // Maybe there is some information in the error itself? Let's check
        // whether it is a messed up reference!
        let location = null;
        const matches = err.message.match(/\$ref pointer "(.*?)"/);

        if (matches) {
          location = [this.source.indexOf(matches[1]), matches[1].length];
        }

        const annotation = this.createAnnotation(ANNOTATIONS.VALIDATION_ERROR,
            null, err.message);

        if (location !== null) {
          annotation.attributes.set('sourceMap', [
            new SourceMap([location]),
          ]);
        }

        return done(new Error(err.message), this.result);
      }

      // Root API Element
      this.api = new Category();
      this.api.classes.push('api');
      this.result.push(this.api);

      // By default there are no groups, just the root API element
      this.group = this.api;

      this.handleSwaggerInfo();
      this.handleSwaggerHost();
      this.handleSwaggerAuth();

      if (swagger.externalDocs) {
        this.createAnnotation(ANNOTATIONS.DATA_LOST, ['externalDocs'],
          'External documentation is not yet supported');
      }

      // Swagger has a paths object to loop through that describes resources
      _.each(_.omit(swagger.paths, isExtension), (pathValue, href) => {
        this.handleSwaggerPath(pathValue, href);
      });

      done(null, this.result);
    });
  }

  // == Internal properties & functions ==

  // Base path (URL) name for the API
  get basePath() {
    return (this.swagger.basePath || '').replace(/[/]+$/, '');
  }

  // Lazy-loaded input AST is made available when we need it. If it can't be
  // loaded, then an annotation is generated with more information about why.
  get ast() {
    if (this._ast !== undefined) {
      return this._ast;
    }

    if (_.isString(this.source)) {
      try {
        this._ast = new Ast(this.source);
      } catch (err) {
        this._ast = null;
        this.createAnnotation(ANNOTATIONS.AST_UNAVAILABLE, null,
          'Input AST could not be composed, so source maps will not be available');
      }
    } else {
      this._ast = null;
      this.createAnnotation(ANNOTATIONS.AST_UNAVAILABLE, null,
        'Source maps are only available with string input');
    }

    return this._ast;
  }

  // This method lets you set the current parsing path and synchronously run
  // a function (e.g. to create an element). If the function returns one or
  // more elements then they will get a source map if one was requested. Once
  // finished, the path is restored to its original value.
  withPath(...args) {
    let i;

    for (i = 0; i < args.length - 1; i++) {
      this.path.push(args[i]);
    }

    let elements = args[args.length - 1].bind(this)(this.path);

    if (elements && this.generateSourceMap) {
      // You can return either an element or an array of elements.
      if (!_.isArray(elements)) {
        elements = [elements];
      }
      for (i of elements) {
        this.createSourceMap(i, this.path);
      }
    }

    for (i = 0; i < args.length - 1; i++) {
      this.path.pop();
    }
  }

  // This is like `withPath` above, but slices the path before calling by
  // using the first argument as a length (starting at index 0).
  withSlicedPath(...args) {
    const original = this.path.slice(0);

    // First, we slice the path, then call `withPath` and finally reset the path.
    this.path = this.path.slice(0, args[0]);
    this.withPath.apply(this, args.slice(1));
    this.path = original;
  }

  // Converts the Swagger title and description
  handleSwaggerInfo() {
    const {Copy} = this.minim.elements;

    if (this.swagger.info) {
      this.withPath('info', () => {
        if (this.swagger.info.title) {
          this.withPath('title', () => {
            this.api.meta.set('title', this.swagger.info.title);
            return this.api.meta.get('title');
          });
        }

        if (this.swagger.info.description) {
          this.withPath('description', () => {
            const description = new Copy(this.swagger.info.description);
            this.api.content.push(description);
            return description;
          });
        }
      });
    }
  }

  // Converts the Swagger hostname and schemes to a Refract host metadata entry.
  handleSwaggerHost() {
    const {Member: MemberElement} = this.minim.elements;

    if (this.swagger.host) {
      this.withPath('host', () => {
        let hostname = this.swagger.host;

        if (this.swagger.schemes) {
          if (this.swagger.schemes.length > 1) {
            this.createAnnotation(ANNOTATIONS.DATA_LOST, ['schemes'],
              'Only the first scheme will be used to create a hostname');
          }

          hostname = `${this.swagger.schemes[0]}://${hostname}`;
        }

        this.api.attributes.set('meta', {});
        const meta = this.api.attributes.get('meta');
        const member = new MemberElement('HOST', hostname);
        member.meta.set('classes', ['user']);
        meta.content.push(member);

        return member;
      });
    }
  }

  // Convert a Swagger auth object into Refract elements.
  handleSwaggerAuth() {
    for (const attribute of ['securityDefinitions', 'security']) {
      if (this.swagger[attribute]) {
        this.createAnnotation(ANNOTATIONS.DATA_LOST, [attribute],
          'Authentication information is not yet supported');
      }
    }
  }

  // Convert a Swagger path into a Refract resource.
  handleSwaggerPath(pathValue, href) {
    const {Copy, Resource} = this.minim.elements;
    const resource = new Resource();

    this.withPath('paths', href, () => {
      // Provide users with a way to add a title to a resource in Swagger
      if (pathValue['x-summary']) {
        this.withPath('x-summary', () => {
          resource.title = pathValue['x-summary'];
          return resource.meta.get('title');
        });
      }

      // Provide users a way to add a description to a resource in Swagger
      if (pathValue['x-description']) {
        this.withPath('x-description', () => {
          const resourceDescription = new Copy(pathValue['x-description']);
          resource.push(resourceDescription);
          return resourceDescription;
        });
      }

      if (this.useResourceGroups()) {
        this.updateResourceGroup(pathValue['x-group-name']);
      }

      this.group.content.push(resource);

      const pathObjectParameters = pathValue.parameters || [];
      const resourceHrefVariables = this.createHrefVariables(pathObjectParameters);

      if (resourceHrefVariables) {
        resource.hrefVariables = resourceHrefVariables;
      }

      // Set the resource-wide URI template, which can further be overridden
      // by individual transition URI templates. When creating a transition
      // below, we *only* set the transition URI template if it differs from
      // the one we've generated here.
      const hrefForResource = buildUriTemplate(this.basePath, href, pathObjectParameters);
      resource.attributes.set('href', hrefForResource);

      // TODO: It should add support for `body` and `formData` parameters as well.
      if (pathObjectParameters.length > 0) {
        pathObjectParameters.forEach((parameter, index) => {
          this.withPath('parameters', index, (path) => {
            if (parameter.in === 'body') {
              this.createAnnotation(ANNOTATIONS.DATA_LOST, path,
                'Path-level body parameters are not yet supported');
            } else if (parameter.in === 'formData') {
              this.createAnnotation(ANNOTATIONS.DATA_LOST, path,
                'Path-level form data parameters are not yet supported');
            }
          });
        });
      }

      const relevantMethods = _.chain(pathValue)
        .omit('parameters', '$ref')
        .omit(isExtension)
        .value();

      // Each path is an object with methods as properties
      _.each(relevantMethods, (methodValue, method) => {
        this.handleSwaggerMethod(resource, href, pathObjectParameters, methodValue, method);
      });

      return resource;
    });
  }

  // Convert a Swagger method into a Refract transition.
  handleSwaggerMethod(resource, href, resourceParameters, methodValue, method) {
    const {Copy, Transition} = this.minim.elements;
    const transition = new Transition();

    resource.content.push(transition);

    this.withPath(method, () => {
      if (methodValue.externalDocs) {
        this.withPath('externalDocs', (path) => {
          this.createAnnotation(ANNOTATIONS.DATA_LOST, path,
          'External documentation is not yet supported');
        });
      }

      const methodValueParameters = methodValue.parameters || [];

      const queryParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'query';
      });

      // Here we generate a URI template specific to this transition. If it
      // is different from the resource URI template, then we set the
      // transition's `href` attribute.
      const hrefForTransition = buildUriTemplate(this.basePath, href, resourceParameters, queryParameters);
      if (hrefForTransition !== resource.attributes.getValue('href')) {
        transition.attributes.set('href', hrefForTransition);
      }

      if (methodValue.summary) {
        this.withPath('summary', () => {
          transition.title = methodValue.summary;
          return transition.meta.get('title');
        });
      }

      if (methodValue.description) {
        this.withPath('description', () => {
          const description = new Copy(methodValue.description);
          transition.push(description);
          return description;
        });
      }

      if (methodValue.operationId) {
        // TODO: Add a source map?
        transition.attributes.set('relation', methodValue.operationId);
      }

      // For each uriParameter, create an hrefVariable
      const methodHrefVariables = this.createHrefVariables(methodValueParameters);
      if (methodHrefVariables) {
        transition.hrefVariables = methodHrefVariables;
      }

      // Currently, default responses are not supported in API Description format
      const relevantResponses = _.chain(methodValue.responses)
        .omit('default')
        .omit(isExtension)
        .value();

      if (methodValue.responses && methodValue.responses.default) {
        this.withPath('responses', 'default', (path) => {
          this.createAnnotation(ANNOTATIONS.DATA_LOST, path,
            'Default response is not yet supported');
        });
      }

      if (_.keys(relevantResponses).length === 0) {
        if (methodValueParameters.filter((p) => p.in === 'body').length) {
          // Create an empty successful response so that the request/response
          // pair gets properly generated. In the future we may want to
          // refactor the code below as this is a little weird.
          relevantResponses.null = {};
        } else {
          this.createTransaction(transition, method);
        }
      }

      // Transactions are created for each response in the document
      _.each(relevantResponses, (responseValue, statusCode) => {
        this.handleSwaggerResponse(resource, transition, method,
          methodValueParameters, responseValue, statusCode);
      });

      return transition;
    });
  }

  // Convert a Swagger response & status code into Refract transactions.
  handleSwaggerResponse(resource, transition, method, transitionParameters, responseValue, statusCode) {
    let examples;

    if (responseValue.examples) {
      examples = responseValue.examples;
    } else {
      // The only way to specify an HTTP method is by creating a transaction,
      // and according to the Refract spec a transaction *MUST* have a request
      // and response within it, so here we seed the examples to create a blank
      // request/response within a new transaction. See:
      // https://github.com/refractproject/refract-spec/blob/master/namespaces/api-description-namespace.md#http-transaction-element
      examples = {
        '': undefined,
      };
    }

    examples = _.omit(examples, 'schema');

    _.each(examples, (responseBody, contentType) => {
      const transaction = this.createTransaction(transition, method);
      const request = transaction.request;

      this.handleSwaggerExampleRequest(transitionParameters, request);
      this.handleSwaggerExampleResponse(transaction, responseValue, statusCode,
        responseBody, contentType);
    });
  }

  // Convert a Swagger example into a Refract request.
  handleSwaggerExampleRequest(transitionParameters, request) {
    const {DataStructure, Object: ObjectElement} = this.minim.elements;

    this.withPath(() => {
      // Body parameters are ones that define JSON Schema
      const bodyParameters = transitionParameters.filter((parameter) => {
        return parameter.in === 'body';
      });

      // Form parameters are send as encoded form data in the body
      const formParameters = transitionParameters.filter((parameter) => {
        return parameter.in === 'formData';
      });

      // Body parameters define request schemas
      _.each(bodyParameters, (bodyParameter) => {
        const schemaAsset = this.createAssetFromJsonSchema(
          bodyParameter.schema);
        request.content.push(schemaAsset);
      });

      // Using form parameters instead of body? We will convert those to
      // data structures.
      if (formParameters.length) {
        const dataStructure = new DataStructure();
        // A form is essentially an object with key/value members
        const dataObject = new ObjectElement();

        _.each(formParameters, (param) => {
          const index = transitionParameters.indexOf(param);
          dataObject.content.push(this.convertParameterToMember(param, this.path.slice(0, 3).concat(['parameters', index])));
        });

        dataStructure.content = dataObject;
        request.content.push(dataStructure);
      }

      return request;
    });
  }

  // Convert a Swagger example into a Refract response.
  handleSwaggerExampleResponse(transaction, responseValue, statusCode, responseBody, contentType) {
    const {
      Asset, Copy, HttpHeaders, Member: MemberElement,
    } = this.minim.elements;
    const response = transaction.response;

    this.withPath('responses', statusCode, () => {
      if (responseValue.description) {
        const description = new Copy(responseValue.description);
        response.content.push(description);
        if (this.generateSourceMap) {
          this.createSourceMap(description, this.path.concat(['description']));
        }
      }

      const headers = new HttpHeaders();

      if (contentType) {
        this.withPath('examples', contentType, () => {
          // Remember, httpHeaders is really an array, *not* an object. Hence
          // we make the member element ourselves until some convenience is
          // added there.
          const contentHeader = new MemberElement(
            'Content-Type', contentType
          );
          headers.push(contentHeader);
          response.headers = headers;
          return contentHeader;
        });
      }

      if (responseValue.headers) {
        response.headers = this.updateHeaders(headers, responseValue.headers);
      }

      this.withPath('examples', () => {
        // Responses can have bodies
        if (responseBody !== undefined) {
          this.withPath(contentType, () => {
            let formattedResponseBody = responseBody;

            if (typeof(responseBody) !== 'string') {
              formattedResponseBody = JSON.stringify(responseBody, null, 2);
            }

            const bodyAsset = new Asset(formattedResponseBody);
            bodyAsset.classes.push('messageBody');
            response.content.push(bodyAsset);

            return bodyAsset;
          });
        }

        // Responses can have schemas in Swagger
        const schema = responseValue.schema || (responseValue.examples && responseValue.examples.schema);
        if (schema) {
          let args;
          if (responseValue.examples && responseValue.examples.schema) {
            args = [5, 'examples', 'schema'];
          } else {
            args = [5, 'schema'];
          }

          this.withSlicedPath.apply(this, args.concat([() => {
            const schemaAsset = this.createAssetFromJsonSchema(schema);
            response.content.push(schemaAsset);
            return schemaAsset;
          }]));
        }

        if (statusCode !== 'null') {
          response.attributes.set('statusCode', statusCode);
        }
      });

      return [transaction, response];
    });
  }

  // Takes in an `httpHeaders` element and a list of Swagger headers. Adds
  // the Swagger headers to the element and then returns the modified element.
  updateHeaders(element, headers) {
    for (const headerName in headers) {
      if (headers.hasOwnProperty(headerName)) {
        this.createHeader(element, headers, headerName);
      }
    }

    return element;
  }

  // Creates an individual header on an element. This does *not* check for
  // duplicate header names.
  createHeader(element, headers, headerName) {
    const {Member: MemberElement} = this.minim.elements;

    this.withPath('headers', headerName, () => {
      const header = headers[headerName];
      let value = '';

      // Choose the first available option
      if (header.enum) {
        // TODO: This may lose data if there are multiple enums.
        value = header.enum[0];
      }

      if (header.default) {
        value = header.default;
      }

      const member = new MemberElement(headerName, value);

      if (header.description) {
        this.withPath('description', () => {
          member.meta.set('description', header.description);
          return member.meta.get('description');
        });
      }

      element.push(member);

      return member;
    });
  }

  // Test whether tags can be treated as resource groups, and if so it sets a
  // group name for each resource (used later to create groups).
  useResourceGroups() {
    const tags = [];

    if (this.swagger.paths) {
      _.each(this.swagger.paths, (path) => {
        let tag = null;

        if (path) {
          _.each(path, (operation) => {
            if (operation.tags && operation.tags.length) {
              if (operation.tags.length > 1) {
                // Too many tags... each resource can only be in one group!
                return false;
              }

              if (tag === null) {
                tag = operation.tags[0];
              } else if (tag !== operation.tags[0]) {
                // Non-matching tags... can't have a resource in multiple groups!
                return false;
              }
            }
          });
        }

        if (tag) {
          path['x-group-name'] = tag;
          tags.push(tag);
        }
      });
    }

    return tags.length > 0;
  }

  // Update the current group by either selecting or creating it.
  updateResourceGroup(name) {
    const {Category, Copy} = this.minim.elements;

    if (name) {
      this.group = this.api.find((el) => el.element === 'category' && el.classes.contains('resourceGroup') && el.title === name).first();

      if (!this.group) {
        // TODO: Source maps for these groups. The problem is that the location
        // may not always make sense. Do we point to the tag description,
        // the resource, or the transition?
        this.group = new Category();
        this.group.title = name;
        this.group.classes.push('resourceGroup');

        if (this.swagger.tags && this.swagger.tags.forEach) {
          this.swagger.tags.forEach((tag) => {
            // TODO: Check for external docs here?
            if (tag.name === name && tag.description) {
              this.group.content.push(new Copy(tag.description));
            }
          });
        }

        this.api.content.push(this.group);
      }
    }
  }

  // Convert a Swagger parameter into a Refract element.
  convertParameterToElement(parameter, path, setAttributes = false) {
    const {
      Array: ArrayElement, Boolean: BooleanElement, Number: NumberElement,
      String: StringElement,
    } = this.minim.elements;
    let element;

    // Convert from Swagger types to Minim elements
    if (parameter.type === 'string') {
      element = new StringElement('');
    } else if (parameter.type === 'integer' || parameter.type === 'number') {
      element = new NumberElement();
    } else if (parameter.type === 'boolean') {
      element = new BooleanElement();
    } else if (parameter.type === 'array') {
      element = new ArrayElement();

      if (parameter.items) {
        element.content = [this.convertParameterToElement(
          parameter.items, (path || []).concat(['items']), true)];
      }
    } else {
      // Default to a string in case we get a type we haven't seen
      element = new StringElement('');
    }

    if (this.generateSourceMap) {
      this.createSourceMap(element, path);
    }

    if (setAttributes) {
      if (parameter.description) {
        element.description = parameter.description;

        if (this.generateSourceMap) {
          this.createSourceMap(element.meta.get('description'), path.concat(['description']));
        }
      }

      if (parameter.required) {
        element.attributes.set('typeAttributes', ['required']);
      }

      if (parameter.default !== undefined) {
        element.attributes.set('default', parameter.default);
      }
    }

    return element;
  }

  // Convert a Swagger parameter into a Refract member element for use in an
  // object element (or subclass).
  convertParameterToMember(parameter, path = this.path) {
    const MemberElement = this.minim.getElementClass('member');
    const memberValue = this.convertParameterToElement(parameter, path);

    // TODO: Update when Minim has better support for elements as values
    // should be: new MemberType(parameter.name, memberValue);
    const member = new MemberElement(parameter.name);
    member.content.value = memberValue;

    if (this.generateSourceMap) {
      this.createSourceMap(member, path);
    }

    if (parameter.description) {
      member.description = parameter.description;

      if (this.generateSourceMap) {
        this.createSourceMap(member.meta.get('description'),
          path.concat(['description']));
      }
    }

    if (parameter.required) {
      member.attributes.set('typeAttributes', ['required']);
    }

    // If there is a default, it is set on the member value instead of the member
    // element itself because the default value applies to the value.
    if (parameter.default) {
      memberValue.attributes.set('default', parameter.default);
    }

    return member;
  }

  // Make a new source map for the given element
  createSourceMap(element, path) {
    if (this.ast) {
      const SourceMap = this.minim.getElementClass('sourceMap');
      const position = this.ast.getPosition(path);
      if (position && !isNaN(position.start) && !isNaN(position.end)) {
        element.attributes.set('sourceMap', [
          new SourceMap([[position.start, position.end - position.start]]),
        ]);
      }
    }
  }

  // Make a new annotation for the given path and message
  createAnnotation(info, path, message) {
    const {Annotation, Link} = this.minim.elements;
    const annotation = new Annotation(message);
    annotation.classes.push(info.type);
    annotation.code = info.code;
    this.result.content.push(annotation);

    if (info.fragment) {
      const link = new Link();
      link.relation = 'origin';
      link.href = `http://docs.apiary.io/validations/swagger#${info.fragment}`;
      annotation.links.push(link);
    }

    if (path && this.ast) {
      this.createSourceMap(annotation, path);
    }

    return annotation;
  }

  // Create a new HrefVariables element from a parameter list. Returns either
  // the new HrefVariables element or `undefined`.
  createHrefVariables(params) {
    const {HrefVariables} = this.minim.elements;
    const hrefVariables = new HrefVariables();

    params.forEach((parameter, index) => {
      this.withPath('parameters', index, () => {
        let member;

        if (parameter.in === 'query' || parameter.in === 'path') {
          member = this.convertParameterToMember(parameter);
          hrefVariables.content.push(member);
        }

        return member;
      });
    });

    return hrefVariables.length ? hrefVariables : undefined;
  }

  // Create a new Refract asset element containing JSON schema.
  createAssetFromJsonSchema(jsonSchema) {
    const Asset = this.minim.getElementClass('asset');
    const schemaAsset = new Asset(JSON.stringify(jsonSchema));
    schemaAsset.classes.push('messageBodySchema');
    schemaAsset.attributes.set('contentType', 'application/schema+json');

    return schemaAsset;
  }

  // Create a new Refract transition element with a blank request and response.
  createTransaction(transition, method) {
    const {HttpRequest, HttpResponse, HttpTransaction} = this.minim.elements;
    const transaction = new HttpTransaction();
    transaction.content = [new HttpRequest(), new HttpResponse()];

    if (transition) {
      transition.content.push(transaction);
    }

    if (method) {
      transaction.request.attributes.set('method', method.toUpperCase());
    }

    return transaction;
  }
}
