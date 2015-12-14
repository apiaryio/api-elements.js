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
    type: 'warning',
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
      Copy, Category, Member: MemberElement, ParseResult, SourceMap,
    } = this.minim.elements;

    const swaggerParser = new SwaggerParser();
    const parseResult = new ParseResult();
    this.result = parseResult;

    let loaded;
    try {
      loaded = _.isString(this.source) ? yaml.safeLoad(this.source) : this.source;
    } catch (err) {
      this.makeAnnotation(ANNOTATIONS.CANNOT_PARSE, null,
        (err.reason || 'Problem loading the input'));

      if (err.mark) {
        parseResult.first().attributes.set('sourceMap', [
          new SourceMap([[err.mark.position, 1]]),
        ]);
      }

      return done(new Error(err.message), parseResult);
    }

    // Some sane defaults since these are sometimes left out completely
    if (loaded.info === undefined) {
      loaded.info = {};
    }

    if (loaded.paths === undefined) {
      loaded.paths = {};
    }

    // Parse and validate the Swagger document!
    swaggerParser.validate(loaded, (err) => {
      const swagger = swaggerParser.api;
      this.swagger = swaggerParser.api;

      if (err) {
        if (swagger === undefined) {
          return done(err, parseResult);
        }

        // Non-fatal errors, so let us try and create annotations for them and
        // continue with the parsing as best we can.
        if (err.details) {
          const queue = [err.details];
          while (queue.length) {
            for (const item of queue[0]) {
              this.makeAnnotation(ANNOTATIONS.VALIDATION_ERROR, item.path,
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
        }
      }

      const api = new Category();
      this.api = api;
      parseResult.push(api);

      // Root API Element
      api.classes.push('api');

      if (swagger.info) {
        this.path.push('info');

        if (swagger.info.title) {
          api.meta.set('title', swagger.info.title);

          if (this.generateSourceMap) {
            this.makeSourceMap(api.meta.get('title'), this.path.concat(['title']));
          }
        }

        if (swagger.info.description) {
          api.content.push(new Copy(swagger.info.description));

          if (this.generateSourceMap) {
            this.makeSourceMap(api.content[api.content.length - 1],
              this.path.concat(['description']));
          }
        }

        this.path.pop();
      }

      if (swagger.host) {
        let hostname = swagger.host;

        if (swagger.schemes) {
          if (swagger.schemes.length > 1) {
            this.makeAnnotation(ANNOTATIONS.DATA_LOST, ['schemes'],
              'Only the first scheme will be used to create a hostname');
          }

          hostname = `${swagger.schemes[0]}://${hostname}`;
        }

        api.attributes.set('meta', {});
        const meta = api.attributes.get('meta');
        const member = new MemberElement('HOST', hostname);
        member.meta.set('classes', ['user']);

        if (this.generateSourceMap) {
          this.makeSourceMap(member, ['host']);
        }

        meta.content.push(member);
      }

      if (swagger.securityDefinitions) {
        this.makeAnnotation(ANNOTATIONS.DATA_LOST, ['securityDefinitions'],
          'Authentication information is not yet supported');
      }

      if (swagger.security) {
        this.makeAnnotation(ANNOTATIONS.DATA_LOST, ['security'],
          'Authentication information is not yet supported');
      }

      if (swagger.externalDocs) {
        this.makeAnnotation(ANNOTATIONS.DATA_LOST, ['externalDocs'],
          'External documentation is not yet supported');
      }

      this.group = api;

      // Swagger has a paths object to loop through
      // The key is the href
      _.each(_.omit(swagger.paths, isExtension), (pathValue, href) => {
        this.handleSwaggerPath(pathValue, href);
      });

      done(null, parseResult);
    });
  }

  // == Internal properties & functions ==

  handleSwaggerPath(pathValue, href) {
    const {
      Asset, Copy, Category, DataStructure, HrefVariables, HttpHeaders,
      Member: MemberElement, Object: ObjectElement, Resource, Transition,
    } = this.minim.elements;
    const resource = new Resource();

    this.path.push('paths');
    this.path.push(href);

    if (this.generateSourceMap) {
      this.makeSourceMap(resource, this.path);
    }

    // Provide users with a way to add a title to a resource in Swagger
    if (pathValue['x-summary']) {
      resource.title = pathValue['x-summary'];
    }

    // Provide users a way to add a description to a resource in Swagger
    if (pathValue['x-description']) {
      const resourceDescription = new Copy(pathValue['x-description']);
      resource.push(resourceDescription);
    }

    if (this.useResourceGroups()) {
      const groupName = pathValue['x-group-name'];

      if (groupName) {
        this.group = this.api.find((el) => el.element === 'category' && el.classes.contains('resourceGroup') && el.title === groupName).first();

        if (!this.group) {
          this.group = new Category();
          this.group.title = groupName;
          this.group.classes.push('resourceGroup');

          if (this.swagger.tags && this.swagger.tags.forEach) {
            this.swagger.tags.forEach((tag) => {
              // TODO: Check for external docs here?
              if (tag.name === groupName && tag.description) {
                this.group.content.push(new Copy(tag.description));
              }
            });
          }

          this.api.content.push(this.group);
        }
      }
    }

    this.group.content.push(resource);

    const pathObjectParameters = pathValue.parameters || [];

    // TODO: Currently this only supports URI parameters for `path` and `query`.
    // It should add support for `body` parameters as well.
    if (pathObjectParameters.length > 0) {
      resource.hrefVariables = new HrefVariables();

      pathObjectParameters.forEach((parameter, index) => {
        this.path.push('parameters');
        this.path.push(index);

        if (parameter.in === 'query' || parameter.in === 'path') {
          const member = this.convertParameterToMember(parameter, this.path);
          if (this.generateSourceMap) {
            this.makeSourceMap(member, this.path);
          }
          resource.hrefVariables.content.push(member);
        } else if (parameter.in === 'body') {
          this.makeAnnotation(ANNOTATIONS.DATA_LOST, this.path,
            'Path-level body parameters are not yet supported');
        }

        this.path.pop();
        this.path.pop();
      });
    }

    const relevantMethods = _.chain(pathValue)
      .omit('parameters', '$ref')
      .omit(isExtension)
      .value();

    // Each path is an object with methods as properties
    _.each(relevantMethods, (methodValue, method) => {
      const transition = new Transition();
      resource.content.push(transition);

      this.path.push(method);

      if (this.generateSourceMap) {
        this.makeSourceMap(transition, this.path);
      }

      if (methodValue.externalDocs) {
        this.makeAnnotation(ANNOTATIONS.DATA_LOST,
          this.path.concat(['externalDocs']),
          'External documentation is not yet supported');
      }

      const methodValueParameters = methodValue.parameters || [];

      const queryParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'query';
      });

      // URI parameters are for query and path variables
      const uriParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'query' || parameter.in === 'path';
      });

      // Body parameters are ones that define JSON Schema
      const bodyParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'body';
      });

      // Form parameters are send as encoded form data in the body
      const formParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'formData';
      });

      const basePath = (this.swagger.basePath || '').replace(/[/]+$/, '');
      const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
      resource.attributes.set('href', hrefForResource);

      if (methodValue.summary) {
        transition.meta.set('title', methodValue.summary);

        if (this.generateSourceMap) {
          const title = transition.meta.get('title');
          this.makeSourceMap(title, this.path.concat(['summary']));
        }
      }

      if (methodValue.description) {
        const description = new Copy(methodValue.description);
        transition.push(description);

        if (this.generateSourceMap) {
          this.makeSourceMap(description, this.path.concat(['description']));
        }
      }

      if (methodValue.operationId) {
        transition.attributes.set('relation', methodValue.operationId);
      }

      // For each uriParameter, create an hrefVariable
      if (uriParameters.length > 0) {
        transition.hrefVariables = new HrefVariables();

        this.path.push('parameters');

        uriParameters.forEach((parameter) => {
          const index = methodValueParameters.indexOf(parameter);
          this.path.push(index);
          transition.hrefVariables.content.push(
            this.convertParameterToMember(parameter, this.path));
          this.path.pop();
        });

        this.path.pop();
      }

      // Currently, default responses are not supported in API Description format
      const relevantResponses = _.chain(methodValue.responses)
        .omit('default')
        .omit(isExtension)
        .value();

      if (methodValue.responses && methodValue.responses.default) {
        this.path.push('responses');
        this.path.push('default');
        this.makeAnnotation(ANNOTATIONS.DATA_LOST, this.path,
          'Default response is not yet supported');
        this.path.pop();
        this.path.pop();
      }

      if (_.keys(relevantResponses).length === 0) {
        if (bodyParameters.length) {
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
        let examples = {
          '': undefined,
        };

        this.path.push('responses');
        this.path.push(statusCode);

        if (responseValue.examples) {
          examples = responseValue.examples;
        }

        examples = _.omit(examples, 'schema');

        _.each(examples, (responseBody, contentType) => {
          const transaction = this.createTransaction(transition, method);
          const request = transaction.request;
          const response = transaction.response;

          if (this.generateSourceMap) {
            this.makeSourceMap(transaction, this.path);
            this.makeSourceMap(request, this.path.slice(0, 3));

            if (statusCode) {
              this.makeSourceMap(response, this.path);
            }
          }

          if (responseValue.description) {
            const description = new Copy(responseValue.description);
            response.content.push(description);
            if (this.generateSourceMap) {
              this.makeSourceMap(description, this.path.concat(['description']));
            }
          }

          const headers = new HttpHeaders();

          if (contentType) {
            headers.push(new MemberElement(
              'Content-Type', contentType
            ));

            if (this.generateSourceMap) {
              this.makeSourceMap(headers.content[headers.content.length - 1], this.path.concat(['examples',  contentType]));
            }

            response.headers = headers;
          }

          if (responseValue.headers) {
            response.headers = this.createHeaders(headers, responseValue.headers);
          }

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
              const index = methodValueParameters.indexOf(param);
              dataObject.content.push(this.convertParameterToMember(param, this.path.slice(0, 3).concat(['parameters', index])));
            });

            dataStructure.content = dataObject;
            request.content.push(dataStructure);
          }

          this.path.push('examples');

          // Responses can have bodies
          if (responseBody !== undefined) {
            let formattedResponseBody = responseBody;

            if (typeof(responseBody) !== 'string') {
              formattedResponseBody = JSON.stringify(responseBody, null, 2);
            }

            const bodyAsset = new Asset(formattedResponseBody);
            bodyAsset.classes.push('messageBody');
            if (this.generateSourceMap) {
              this.path.push(contentType);
              this.makeSourceMap(bodyAsset, this.path);
              this.path.pop();
            }
            response.content.push(bodyAsset);
          }

          // Responses can have schemas in Swagger
          const schema = responseValue.schema || (responseValue.examples && responseValue.examples.schema);
          if (schema) {
            const schemaAsset = this.createAssetFromJsonSchema(schema);
            if (this.generateSourceMap) {
              let schemaPath = this.path.slice(0, 5);
              if (responseValue.examples && responseValue.examples.schema) {
                schemaPath = schemaPath.concat(['examples', 'schema']);
              } else {
                schemaPath = schemaPath.concat(['schema']);
              }
              this.makeSourceMap(schemaAsset, schemaPath);
            }
            response.content.push(schemaAsset);
          }

          if (statusCode !== 'null') {
            response.attributes.set('statusCode', statusCode);
          }

          this.path.pop();
        });

        this.path.pop();
        this.path.pop();
      });

      this.path.pop();
      this.path.pop();
    });

    this.path.pop();
  }

  // Takes in an `httpHeaders` element and a list of Swagger headers. Adds
  // the Swagger headers to the element and then returns the modified element.
  createHeaders(element, headers) {
    const {Member: MemberElement} = this.minim.elements;

    this.path.push('headers');

    for (const headerName in headers) {
      if (headers.hasOwnProperty(headerName)) {
        const header = headers[headerName];
        let value = '';

        // Choose the first available option
        if (header.enum) {
          value = header.enum[0];
        }

        if (header.default) {
          value = header.default;
        }

        const member = new MemberElement(headerName, value);

        if (this.generateSourceMap) {
          this.makeSourceMap(member, this.path.concat([headerName]));
        }

        if (header.description) {
          member.meta.set('description', header.description);

          if (this.generateSourceMap) {
            this.makeSourceMap(member.meta.get('description'), this.path.concat(['description']));
          }
        }

        element.push(member);
      }
    }

    this.path.pop();

    return element;
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
        this.makeAnnotation(ANNOTATIONS.AST_UNAVAILABLE, null,
          'Input AST could not be composed, so source maps will not be available');
      }
    } else {
      this._ast = null;
      this.makeAnnotation(ANNOTATIONS.AST_UNAVAILABLE, null,
        'Source maps are only available with string input');
    }

    return this._ast;
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

  // Make a new source map for the given element
  makeSourceMap(element, path) {
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
  makeAnnotation(info, path, message) {
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
      this.makeSourceMap(annotation, path);
    }
  }

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
      this.makeSourceMap(element, path);
    }

    if (setAttributes) {
      if (parameter.description) {
        element.description = parameter.description;

        if (this.generateSourceMap) {
          this.makeSourceMap(element.meta.get('description'), path.concat(['description']));
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

  convertParameterToMember(parameter, path) {
    const MemberElement = this.minim.getElementClass('member');
    const memberValue = this.convertParameterToElement(parameter, path);

    // TODO: Update when Minim has better support for elements as values
    // should be: new MemberType(parameter.name, memberValue);
    const member = new MemberElement(parameter.name);
    member.content.value = memberValue;

    if (this.generateSourceMap) {
      this.makeSourceMap(member, path);
    }

    if (parameter.description) {
      member.description = parameter.description;

      if (this.generateSourceMap) {
        this.makeSourceMap(member.meta.get('description'),
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

  createAssetFromJsonSchema(jsonSchema) {
    const Asset = this.minim.getElementClass('asset');
    const schemaAsset = new Asset(JSON.stringify(jsonSchema));
    schemaAsset.classes.push('messageBodySchema');
    schemaAsset.attributes.set('contentType', 'application/schema+json');

    return schemaAsset;
  }

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
