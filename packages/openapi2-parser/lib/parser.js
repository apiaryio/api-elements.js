// The main Swagger parsing component that outputs refract.

const _ = require('lodash');
const { sep } = require('path');
const yaml = require('js-yaml');
const contentTypeModule = require('content-type');
const mediaTyper = require('media-typer');
const SwaggerParser = require('swagger-parser');
const ZSchema = require('z-schema');
const annotations = require('./annotations');
const { bodyFromSchema, bodyFromFormParameter } = require('./generator');
const uriTemplate = require('./uri-template');
const { baseLink, origin } = require('./link');
const { pushHeader, pushHeaderObject } = require('./headers');
const Ast = require('./ast');
const { DataStructureGenerator, idForDataStructure } = require('./schema');
const { isExtension, convertSchema, convertSchemaDefinitions } = require('./json-schema');
const {
  FORM_CONTENT_TYPE, isValidContentType, isJsonContentType, isTextContentType, isMultiPartFormData, isFormURLEncoded, hasBoundary, parseBoundary,
} = require('./media-type');

// The parser holds state about the current parsing environment and converts
// the input Swagger into Refract elements. The `parse` function is its main
// interface.
class Parser {
  constructor({
    namespace, source, generateSourceMap, generateMessageBody, generateMessageBodySchema,
  }) {
    // Parser options
    this.namespace = namespace;
    this.source = source;
    this.generateSourceMap = generateSourceMap;

    if (generateMessageBody === undefined) {
      this.generateMessageBody = true;
    } else {
      this.generateMessageBody = generateMessageBody;
    }

    if (generateMessageBodySchema === undefined) {
      this.generateMessageBodySchema = true;
    } else {
      this.generateMessageBodySchema = generateMessageBodySchema;
    }

    // Global scheme requirements
    this.globalSchemes = [];

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
    } = this.namespace.elements;
    const swaggerParser = new SwaggerParser();

    this.result = new ParseResult();

    // First, we load the YAML if it is a string, and handle any errors.
    let loaded;
    try {
      loaded = _.isString(this.source) ? yaml.safeLoad(this.source) : this.source;
    } catch (err) {
      // Temporarily disable generateSourceMap while handling error
      // This is because while handling this error we may try to generate
      // source map which further tries to parse YAML to get source
      // maps which causes another warning and raise conditions where we throw
      // an error back to the caller.
      const { generateSourceMap } = this;
      this.generateSourceMap = false;

      this.createAnnotation(
        annotations.CANNOT_PARSE, null,
        (err.reason || 'Problem loading the input')
      );

      if (err.mark) {
        this.result.first.attributes.set('sourceMap', [
          new SourceMap([[err.mark.position, 1]]),
        ]);
      }

      this.generateSourceMap = generateSourceMap;
      return done(null, this.result);
    }

    if (!_.isObject(loaded)) {
      this.createAnnotation(
        annotations.CANNOT_PARSE, null,
        ('Swagger document is not an object')
      );

      return done(null, this.result);
    }

    if (loaded.swagger === undefined) {
      this.createAnnotation(
        annotations.VALIDATION_ERROR, null,
        ('Missing required key "swagger"')
      );

      return done(null, this.result);
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
    const swaggerOptions = {
      dereference: {
        circular: 'ignore',
      },
      resolve: {
        external: false,
      },
    };

    // Swagger parser is mutating the given input and dereferencing.
    // Let's give it no changes to screw the original and give it a deep copy
    const referencedSwagger = JSON.parse(JSON.stringify(loaded));
    this.referencedSwagger = referencedSwagger;

    return swaggerParser.validate(loaded, swaggerOptions, (err) => {
      const swagger = swaggerParser.api;
      this.swagger = swaggerParser.api;

      if (err) {
        if (this.swagger === undefined) {
          return done(err, this.result);
        }

        // Non-fatal errors, so let us try and create annotations for them and
        // continue with the parsing as best we can.
        if (err.details) {
          err.details.forEach((error) => {
            this.createValidationAnnotation(error);
          });

          return done(null, this.result);
        }

        // Maybe there is some information in the error itself? Let's check
        // whether it is a messed up reference!
        let location = null;

        // Workaround for https://github.com/APIDevTools/json-schema-ref-parser/pull/80#issuecomment-436041573
        const message = err.message.replace(`${process.cwd()}${sep}`, '');
        const matches = message.match(/\$ref pointer "(.*?)"/);

        if (matches) {
          location = [this.source.indexOf(matches[1]), matches[1].length];
        }

        const annotation = this.createAnnotation(annotations.VALIDATION_ERROR, null, message);

        if (location !== null) {
          annotation.attributes.set('sourceMap', [
            new SourceMap([location]),
          ]);
        } else {
          // Some validation errors contain `in '/some/path'`,
          // we can extract path to get source map
          const matchesPath = message.match(/in '\/(.*?)'/);

          if (matchesPath) {
            const path = matchesPath[1].split('/');
            this.createSourceMap(annotation, path, true);
          }
        }

        return done(null, this.result);
      }

      try {
        // Root API Element
        this.api = new Category();
        this.api.classes.push('api');
        this.result.push(this.api);

        // By default there are no groups, just the root API element
        this.group = this.api;

        this.handleSwaggerInfo();
        this.handleSwaggerHost();
        this.handleSwaggerAuth();

        this.handleExternalDocs(this.api, swagger.externalDocs);

        this.validateProduces(this.swagger.produces);
        this.validateConsumes(this.swagger.consumes);

        this.definitions = convertSchemaDefinitions(referencedSwagger.definitions);

        const paths = _.omitBy(swagger.paths, isExtension);

        _.forOwn(paths, (pathValue, href) => {
          this.handleSwaggerPath(pathValue, href);
        });

        this.handleSwaggerVendorExtensions(this.api, swagger.paths);

        if (this.definitions) {
          this.withPath('definitions', () => {
            this.handleSwaggerDefinitions(referencedSwagger.definitions);
          });
        }

        return done(null, this.result);
      } catch (exception) {
        this.createAnnotation(
          annotations.UNCAUGHT_ERROR, null,
          'There was a problem converting the Swagger document'
        );

        return done(exception, this.result);
      }
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
    if (this.internalAST !== undefined) {
      return this.internalAST;
    }

    if (_.isString(this.source)) {
      try {
        this.internalAST = new Ast(this.source);
      } catch (err) {
        this.internalAST = null;

        let message = 'YAML Syntax Error';
        if (err.problem) {
          message = `${message}: ${err.problem}`;
        }

        const annotation = this.createAnnotation(annotations.AST_UNAVAILABLE, null, message);

        if (err.problem_mark && err.problem_mark.pointer) {
          const SourceMap = this.namespace.getElementClass('sourceMap');
          const position = err.problem_mark.pointer;

          annotation.attributes.set('sourceMap', [
            new SourceMap([[position, 1]]),
          ]);
        }
      }
    } else {
      this.internalAST = null;
      this.createAnnotation(
        annotations.AST_UNAVAILABLE, null,
        'Source maps are only available with string input'
      );
    }

    return this.internalAST;
  }

  // This method lets you set the current parsing path and synchronously run
  // a function (e.g. to create an element).
  withPath(...args) {
    let i;
    const originalPath = _.clone(this.path);

    for (i = 0; i < args.length - 1; i += 1) {
      if (args[i] === '..') {
        this.path.pop();
      } else if (args[i] === '.') {
        // do nothing
      } else {
        this.path.push(args[i]);
      }
    }

    args[args.length - 1].bind(this)(this.path);

    this.path = originalPath;
  }

  // This is like `withPath` above, but slices the path before calling by
  // using the first argument as a length (starting at index 0).
  withSlicedPath(...args) {
    const original = this.path.slice(0);

    // First, we slice the path, then call `withPath` and finally reset the path.
    this.path = this.path.slice(0, args[0]);
    this.withPath(...args.slice(1));
    this.path = original;
  }

  handleExternalDocs(element, docs) {
    if (!docs) {
      return;
    }

    baseLink(element, this, 'help', {
      description: docs.description,
      url: docs.url,
      path: this.path.concat(['externalDocs']),
    });
  }

  // Converts the Swagger title and description
  handleSwaggerInfo() {
    const { Copy } = this.namespace.elements;

    if (this.swagger.info) {
      this.withPath('info', () => {
        if (this.swagger.info.title) {
          this.withPath('title', () => {
            this.api.title = this.swagger.info.title;

            if (this.generateSourceMap) {
              this.createSourceMap(this.api.meta.get('title'), this.path);
            }

            return this.api.meta.get('title');
          });
        }

        if (this.swagger.info.termsOfService) {
          this.withPath('termsOfService', () => {
            const { Link } = this.namespace.elements;
            const link = new Link();

            link.relation = 'terms-of-service';
            link.href = this.swagger.info.termsOfService;

            if (this.generateSourceMap) {
              this.createSourceMap(link, this.path);
            }

            return this.api.links.push(link);
          });
        }

        if (this.swagger.info.version) {
          this.withPath('version', () => {
            this.api.attributes.set('version', this.swagger.info.version);

            if (this.generateSourceMap) {
              this.createSourceMap(this.api.attributes.get('version'), this.path);
            }

            return this.api.attributes.get('version');
          });
        }

        if (this.swagger.info.description) {
          this.withPath('description', () => {
            const description = new Copy(this.swagger.info.description);
            this.api.content.push(description);

            if (this.generateSourceMap) {
              this.createSourceMap(description, this.path);
            }

            return description;
          });
        }

        if (this.swagger.info.contact) {
          this.withPath('contact', () => {
            const { Link } = this.namespace.elements;
            const { name, url, email } = this.swagger.info.contact;

            if (url) {
              this.withPath('url', () => {
                const link = new Link();
                link.relation = 'contact';
                link.href = url;

                if (name) {
                  link.title = name;
                }

                if (this.generateSourceMap) {
                  this.createSourceMap(link.href, this.path);
                }

                this.api.links.push(link);
              });
            }

            if (email) {
              this.withPath('email', () => {
                const link = new Link();
                link.relation = 'contact';
                link.href = `mailto:${email}`;

                if (!url && name) {
                  link.title = name;
                }

                if (this.generateSourceMap) {
                  this.createSourceMap(link.href, this.path);
                }

                this.api.links.push(link);
              });
            }
          });
        }

        this.handleSwaggerVendorExtensions(this.api, this.swagger.info);
      });
    }
  }

  // Converts the Swagger hostname and schemes to a Refract host metadata entry.
  handleSwaggerHost() {
    const { Member: MemberElement } = this.namespace.elements;

    if (this.swagger.host) {
      this.withPath('host', () => {
        let hostname = this.swagger.host;

        if (this.swagger.schemes) {
          if (this.swagger.schemes.length > 1) {
            this.createAnnotation(
              annotations.DATA_LOST, ['schemes'],
              'Only the first scheme will be used to create a hostname'
            );
          }

          hostname = `${this.swagger.schemes[0]}://${hostname}`;
        } else {
          hostname = `https://${hostname}`;
        }

        const metadata = [];
        const member = new MemberElement('HOST', hostname);

        member.meta.set('classes', ['user']);

        if (this.generateSourceMap) {
          this.createSourceMap(member, this.path);
        }

        metadata.push(member);
        this.api.attributes.set('metadata', metadata);

        return member;
      });
    }
  }

  // Conver api key name into Refract elements
  apiKeyName(element, apiKey) {
    const { Member: MemberElement } = this.namespace.elements;
    let config;

    if (apiKey.in === 'query') {
      config = 'queryParameterName';
    } else if (apiKey.in === 'header') {
      config = 'httpHeaderName';
    }

    const member = new MemberElement(config, apiKey.name);

    if (this.generateSourceMap) {
      this.createSourceMap(member, this.path.concat(['name']));
    }

    element.content.push(member);
  }

  // Convert Oauth2 flow into Refract elements
  oauthGrantType(element, flow) {
    const { Member: MemberElement } = this.namespace.elements;
    let grantType = flow;

    if (flow === 'password') {
      grantType = 'resource owner password credentials';
    } else if (flow === 'application') {
      grantType = 'client credentials';
    } else if (flow === 'accessCode') {
      grantType = 'authorization code';
    }

    const member = new MemberElement('grantType', grantType);

    if (this.generateSourceMap) {
      this.createSourceMap(member, this.path.concat(['flow']));
    }

    element.content.push(member);
  }

  // Convert OAuth2 scopes into Refract elements
  oauthScopes(element, items) {
    const {
      Member: MemberElement,
      Array: ArrayElement,
      String: StringElement,
    } = this.namespace.elements;

    const scopes = new ArrayElement();
    let descriptions = null;
    let scopesList = items;

    if (_.isObject(items) && !_.isArray(items)) {
      descriptions = Object.values(items);
      scopesList = Object.keys(items);
    }

    // If value is not an empty array, then they are scopes
    _.forEach(scopesList, (scopeName, index) => {
      const scope = new StringElement(scopeName);

      if (descriptions) {
        scope.description = descriptions[index];

        if (this.generateSourceMap) {
          this.createSourceMap(scope.meta.get('description'), this.path.concat([scopeName]));
        }
      }

      if (this.generateSourceMap) {
        const value = descriptions ? scopeName : index;
        this.createSourceMap(scope, this.path.concat([value]));
      }

      scopes.content.push(scope);
    });

    if (scopes.length) {
      element.content.push(new MemberElement('scopes', scopes));
    }
  }

  // Conver OAuth2 transition information into Refract elements
  oauthTransitions(element, oauth) {
    const { Transition } = this.namespace.elements;

    if (oauth.authorizationUrl) {
      const transition = new Transition();

      transition.relation = 'authorize';
      transition.href = oauth.authorizationUrl;

      if (this.generateSourceMap) {
        this.createSourceMap(transition.attributes.get('href'), this.path.concat(['authorizationUrl']));
        this.createSourceMap(transition.attributes.get('relation'), this.path.concat(['authorizationUrl']));
      }

      element.content.push(transition);
    }

    if (oauth.tokenUrl) {
      const transition = new Transition();

      transition.relation = 'token';
      transition.href = oauth.tokenUrl;

      if (this.generateSourceMap) {
        this.createSourceMap(transition.attributes.get('href'), this.path.concat(['tokenUrl']));
        this.createSourceMap(transition.attributes.get('relation'), this.path.concat(['tokenUrl']));
      }

      element.content.push(transition);
    }
  }

  // Convert a Swagger auth object into Refract elements.
  handleSwaggerAuth() {
    const { Category, AuthScheme } = this.namespace.elements;
    const schemes = [];

    if (this.swagger.securityDefinitions) {
      _.keys(this.swagger.securityDefinitions).forEach((name) => {
        this.withPath('securityDefinitions', name, () => {
          const item = this.swagger.securityDefinitions[name];
          const element = new AuthScheme();

          switch (item.type) {
            case 'basic':
              element.element = 'Basic Authentication Scheme';
              break;

            case 'apiKey':
              element.element = 'Token Authentication Scheme';
              this.apiKeyName(element, item);
              break;

            case 'oauth2':
              element.element = 'OAuth2 Scheme';
              this.oauthGrantType(element, item.flow);

              if (item.scopes) {
                this.withPath('scopes', () => {
                  this.oauthScopes(element, item.scopes);
                });
              }

              this.oauthTransitions(element, item);
              break;

            default:
              break;
          }

          element.id = name;

          if (this.generateSourceMap) {
            this.createSourceMap(element.meta.get('id'), this.path);
          }

          if (item['x-summary']) {
            element.title = item['x-summary'];

            if (this.generateSourceMap) {
              this.createSourceMap(element.meta.get('title'), this.path.concat(['x-summary']));
            }
          }

          if (item.description) {
            element.description = item.description;

            if (this.generateSourceMap) {
              this.createSourceMap(element.meta.get('description'), this.path.concat(['description']));
            }
          }

          schemes.push(element);

          this.handleSwaggerVendorExtensions(element, item);
        });
      });
    }

    if (schemes.length) {
      const category = new Category();

      category.meta.set('classes', ['authSchemes']);
      category.content = schemes;

      this.api.content.push(category);
    }

    if (!this.swagger.security) {
      return;
    }

    this.handleSwaggerSecurity(this.swagger.security, this.globalSchemes);
  }

  handleSwaggerSecurity(security, schemes) {
    const { AuthScheme } = this.namespace.elements;

    _.forEach(security, (item, index) => {
      _.keys(item).forEach((name) => {
        this.withPath('security', index, name, () => {
          const element = new AuthScheme();

          // If value is not an empty array, then they are scopes
          this.oauthScopes(element, item[name]);

          if (this.generateSourceMap) {
            this.createSourceMap(element, this.path);
          }

          element.element = name;
          schemes.push(element);
        });
      });
    });
  }

  handleSwaggerTransitionAuth(methodValue) {
    const schemes = [];

    if (!methodValue.security) {
      return this.globalSchemes;
    }

    this.handleSwaggerSecurity(methodValue.security, schemes);

    return schemes;
  }

  handleSwaggerDefinitions(definitions) {
    const { Category } = this.namespace.elements;
    const generator = new DataStructureGenerator(this.namespace, this.referencedSwagger);
    const dataStructures = new Category();
    dataStructures.classes.push('dataStructures');

    _.forOwn(definitions, (schema, key) => {
      this.withPath(key, () => {
        try {
          const dataStructure = generator.generateDataStructure(schema);

          if (dataStructure) {
            dataStructure.content.id = idForDataStructure(`#/definitions/${key}`);

            if (this.generateSourceMap) {
              this.createSourceMap(dataStructure, this.path);
            }

            dataStructures.push(dataStructure);
          }
        } catch (error) {
          // TODO: Expose errors once feature is more-complete
        }
      });
    });

    if (dataStructures.length > 0) {
      this.api.push(dataStructures);
    }
  }

  // Convert a Swagger path into a Refract resource.
  handleSwaggerPath(pathValue, href) {
    const { Copy, Resource } = this.namespace.elements;
    const resource = new Resource();

    this.withPath('paths', href, () => {
      // Provide users with a way to add a title to a resource in Swagger
      if (pathValue['x-summary']) {
        this.withPath('x-summary', () => {
          resource.title = String(pathValue['x-summary']);

          if (this.generateSourceMap) {
            this.createSourceMap(resource.meta.get('title'), this.path);
          }

          return resource.meta.get('title');
        });
      }

      // Provide users a way to add a description to a resource in Swagger
      if (pathValue['x-description']) {
        this.withPath('x-description', () => {
          const resourceDescription = new Copy(pathValue['x-description']);
          resource.push(resourceDescription);

          if (this.generateSourceMap) {
            this.createSourceMap(resourceDescription, this.path);
          }

          return resourceDescription;
        });
      }

      const pathObjectParameters = pathValue.parameters || [];
      const resourceHrefVariables = this.createHrefVariables(pathObjectParameters);

      if (resourceHrefVariables) {
        resource.hrefVariables = resourceHrefVariables;
      }

      // Set the resource-wide URI template, which can further be overridden
      // by individual transition URI templates. When creating a transition
      // below, we *only* set the transition URI template if it differs from
      // the one we've generated here.
      resource.href = uriTemplate(this.basePath, href, pathObjectParameters);

      if (this.generateSourceMap) {
        this.createSourceMap(resource.attributes.get('href'), this.path);
      }

      const relevantMethods = _.chain(pathValue)
        .omit('parameters', '$ref')
        .omitBy(isExtension)
        .value();

      // Each path is an object with methods as properties
      _.forOwn(relevantMethods, (methodValue, method) => {
        this.handleSwaggerMethod(resource, href, pathObjectParameters, methodValue, method);
      });

      this.handleSwaggerVendorExtensions(resource, pathValue);

      const operationsHaveTags = Object.values(relevantMethods).some(method => method.tags !== undefined && method.tags.length > 0);
      if (operationsHaveTags) {
        if (this.useResourceGroups()) {
          this.updateResourceGroup(pathValue['x-group-name']);
        }

        this.group.content.push(resource);
      } else {
        this.api.push(resource);
      }

      return resource;
    });
  }

  // Converts all unknown Swagger vendor extensions from an object into a API Element extension
  handleSwaggerVendorExtensions(element, object) {
    const extensions = _.chain(object)
      .pickBy(isExtension)
      .omit('x-description', 'x-summary', 'x-group-name')
      .value();

    if (Object.keys(extensions).length > 0) {
      const { Link, Extension } = this.namespace.elements;

      const profileLink = new Link();
      profileLink.relation = 'profile';
      profileLink.href = 'https://help.apiary.io/profiles/api-elements/vendor-extensions/';

      const extension = new Extension(extensions);
      extension.links = [profileLink];
      element.content.push(extension);
    }
  }

  // Convert a Swagger method into a Refract transition.
  handleSwaggerMethod(resource, href, resourceParams, methodValue, method) {
    const { Copy, Transition } = this.namespace.elements;
    const transition = new Transition();

    resource.content.push(transition);

    this.withPath(method, () => {
      const schemes = this.handleSwaggerTransitionAuth(methodValue);

      this.validateProduces(methodValue.produces);
      this.validateConsumes(methodValue.consumes);

      this.handleExternalDocs(transition, methodValue.externalDocs);

      const transitionParams = methodValue.parameters || [];

      const queryParams = transitionParams.filter(parameter => parameter.in === 'query');

      // Here we generate a URI template specific to this transition. If it
      // is different from the resource URI template, then we set the
      // transition's `href` attribute.
      const hrefForTransition = uriTemplate(this.basePath, href, resourceParams, queryParams);

      if (hrefForTransition !== resource.href.toValue()) {
        transition.href = hrefForTransition;
      }

      if (methodValue.summary) {
        this.withPath('summary', () => {
          transition.title = methodValue.summary;

          if (this.generateSourceMap) {
            this.createSourceMap(transition.meta.get('title'), this.path);
          }

          return transition.meta.get('title');
        });
      }

      if (methodValue.description) {
        this.withPath('description', () => {
          const description = new Copy(methodValue.description);
          transition.push(description);

          if (this.generateSourceMap) {
            this.createSourceMap(description, this.path);
          }

          return description;
        });
      }

      if (methodValue.operationId) {
        // TODO: Add a source map?
        transition.id = methodValue.operationId;
      }

      // For each uriParameter, create an hrefVariable
      const methodHrefVariables = this.createHrefVariables(transitionParams);
      if (methodHrefVariables) {
        transition.hrefVariables = methodHrefVariables;
      }

      // Currently, default responses are not supported in API Description format
      const relevantResponses = _.chain(methodValue.responses)
        .omit('default')
        .omitBy(isExtension)
        .value();

      if (methodValue.responses && methodValue.responses.default) {
        this.withPath('responses', 'default', (path) => {
          this.createAnnotation(
            annotations.DATA_LOST, path,
            'Default response is not yet supported'
          );
        });
      }

      if (_.keys(relevantResponses).length === 0) {
        if (transitionParams.filter(p => p.in === 'body').length) {
          // Create an empty successful response so that the request/response
          // pair gets properly generated. In the future we may want to
          // refactor the code below as this is a little weird.
          relevantResponses.null = {};
        } else {
          this.createTransaction(transition, method, schemes);
        }
      }

      // Transactions are created for each response in the document
      _.forOwn(relevantResponses, (responseValue, statusCode) => {
        this.handleSwaggerResponse(
          transition, method, methodValue,
          transitionParams, responseValue, statusCode,
          schemes, resourceParams
        );
      });

      this.handleSwaggerVendorExtensions(transition, methodValue);

      return transition;
    });
  }

  // Returns all of the content types for a request
  // Request content types include all consumes types
  // Returns `[null]` when there are no content types
  gatherRequestContentTypes(methodValue) {
    const contentTypes = (methodValue.consumes || this.swagger.consumes || [])
      .filter(isValidContentType);

    if (contentTypes.length === 0) {
      return [null];
    }

    return contentTypes;
  }

  // Returns all of the content types for a response
  // Response content types include all example types OR the first JSON content type
  // Returns `[null]` when there are no content types
  gatherResponseContentTypes(methodValue, examples) {
    let contentTypes = [];

    if (examples && Object.keys(examples).length > 0) {
      contentTypes = Object.keys(examples);
    } else {
      const produces = (methodValue.produces || this.swagger.produces || []);
      const jsonContentTypes = produces.filter(isJsonContentType);

      if (jsonContentTypes.length > 0) {
        contentTypes = [jsonContentTypes[0]];
      }
    }

    contentTypes = contentTypes.filter(isValidContentType);

    if (contentTypes.length === 0) {
      return [null];
    }

    return contentTypes;
  }

  // Convert a Swagger response & status code into Refract transactions.
  handleSwaggerResponse(
    transition, method, methodValue, transitionParams,
    responseValue, statusCode, schemes, resourceParams
  ) {
    const requestContentTypes = this.gatherRequestContentTypes(methodValue);
    const responseContentTypes = this
      .gatherResponseContentTypes(methodValue, responseValue.examples);

    responseContentTypes.forEach((responseContentType) => {
      let responseBody;

      if (responseContentType && responseValue.examples
          && responseValue.examples[responseContentType]) {
        responseBody = responseValue.examples[responseContentType];
      }

      requestContentTypes.forEach((requestContentType) => {
        const transaction = this.createTransaction(transition, method, schemes);

        this.handleSwaggerExampleRequest(
          transaction, methodValue, transitionParams,
          resourceParams, requestContentType, responseContentType, responseBody === undefined
        );

        this.handleSwaggerExampleResponse(
          transaction, methodValue, responseValue,
          statusCode, responseBody, responseContentType
        );
      });
    });
  }

  // Convert a Swagger example into a Refract request.
  handleSwaggerExampleRequest(
    transaction, methodValue, transitionParams, resourceParams,
    requestContentType, responseContentType, contentTypeFromProduces
  ) {
    let contentType = requestContentType;
    const { request } = transaction;

    this.withPath(() => {
      const consumeIsJson = contentType && isJsonContentType(contentType);
      const consumeIsMultipartFormData = contentType && isMultiPartFormData(contentType);

      if (consumeIsMultipartFormData && !hasBoundary(contentType)) {
        // When multipart/form-data conntent type doesn't have a boundary
        // add a default one `BOUNDARY` which hopefully isn't found
        // in an example content. `parseBoundary` will provide the default.
        contentType += `; boundary=${parseBoundary(contentType)}`;
      }

      if (contentType) {
        pushHeader('Content-Type', contentType, request, this, 'consumes-content-type');
      }

      if (responseContentType) {
        if (contentTypeFromProduces) {
          pushHeader('Accept', responseContentType, request, this, 'produces-accept');
        } else {
          pushHeader('Accept', responseContentType, request, this);
        }
      }

      const formParams = [];
      let formParamsSchema = { type: 'object', properties: {}, required: [] };

      const parametersGenerator = {};

      _.forEach([
        [resourceParams, '..'],
        [transitionParams, '.'],
      ], (parameters) => {
        _.forEach(parameters[0], (param, index) => {
          switch (param.in) {
            case 'header':
              _.set(parametersGenerator, [param.in, param.name], _.bind(this.withPath, this, parameters[1], 'parameters', index, () => {
                pushHeaderObject(param.name, param, request, this);
              }));
              break;

            case 'body': {
              let bodyIsPrimitive = false;

              _.set(parametersGenerator, [param.in, param.name], _.bind(this.withPath, this, parameters[1], 'parameters', index, () => {
                if (param['x-example']) {
                  this.withPath('x-example', () => {
                    this.createAnnotation(
                      annotations.VALIDATION_ERROR, this.path,
                      'The \'x-example\' property isn\'t allowed for body parameters - use \'schema.example\' instead'
                    );
                  });
                }

                if (param.schema) {
                  if (param.schema.format === 'binary') {
                    return;
                  }

                  bodyIsPrimitive = (param.schema.type && ['string', 'boolean', 'number'].includes(param.schema.type));
                }

                this.withPath('schema', () => {
                  const pushBody = (consumeIsJson
                      || (bodyIsPrimitive && isTextContentType(contentType)));
                  this.pushAssets(param.schema, request, contentType, pushBody);
                });
              }));
              break;
            }

            case 'formData':
              _.set(parametersGenerator, [param.in, param.name], _.bind(this.withPath, this, parameters[1], 'parameters', index, () => {
                this.formDataParameterCheck(param);
                formParamsSchema = bodyFromFormParameter(param, formParamsSchema);
                const member = this.convertParameterToMember(param);
                formParams.push(member);
              }));
              break;

            default:
          }
        });
      });

      _.forEach(parametersGenerator, (paramType) => {
        _.forEach(paramType, (invoke) => {
          invoke();
        });
      });

      if (!contentType || consumeIsMultipartFormData || isFormURLEncoded(contentType)) {
        this.generateFormParameters(formParams, formParamsSchema, request, contentType);
      }

      // Using form parameters instead of body? We will convert those to
      // data structures and will generate form-urlencoded body.
      return request;
    });
  }

  generateFormParameters(parameters, schema, request, contentType) {
    if (_.isEmpty(parameters)) {
      return;
    }

    const { DataStructure, Object: ObjectElement } = this.namespace.elements;

    if (!contentType) {
      // No content type was provided, lets default to first form
      pushHeader('Content-Type', FORM_CONTENT_TYPE, request, this, 'form-data-content-type');
    }

    if (this.generateMessageBody) {
      const jsonSchema = convertSchema(schema, { definitions: this.definitions },
        this.referencedSwagger);
      bodyFromSchema(jsonSchema, request, this, contentType || FORM_CONTENT_TYPE);
    }

    // Generating data structure
    const dataStructure = new DataStructure();

    // A form is essentially an object with key/value members
    const dataObject = new ObjectElement();

    _.forEach(parameters, (param) => {
      dataObject.content.push(param);
    });

    dataStructure.content = dataObject;
    request.content.push(dataStructure);
  }

  formDataParameterCheck(param) {
    if (param.type === 'array') {
      this.createAnnotation(
        annotations.DATA_LOST, this.path,
        'Arrays in form parameters are not fully supported yet'
      );

      return;
    }

    if (param.allowEmptyValue) {
      this.createAnnotation(
        annotations.DATA_LOST, this.path,
        'The allowEmptyValue flag is not fully supported yet'
      );
    }
  }

  // Convert a Swagger example into a Refract response.
  handleSwaggerExampleResponse(
    transaction, methodValue, responseValue,
    statusCode, responseBody, contentType
  ) {
    const { Asset, Copy } = this.namespace.elements;
    const { response } = transaction;

    this.withPath('responses', statusCode, () => {
      if (responseValue.description) {
        const description = new Copy(responseValue.description);
        response.content.push(description);

        if (this.generateSourceMap) {
          this.createSourceMap(description, this.path.concat(['description']));
        }
      }

      if (contentType) {
        if (responseValue.examples && responseValue.examples[contentType]) {
          this.withPath('examples', contentType, () => {
            pushHeader('Content-Type', contentType, response, this);
          });
        } else {
          pushHeader('Content-Type', contentType, response, this, 'produces-content-type');
        }
      }

      const isJsonResponse = isJsonContentType(contentType);

      if (responseValue.headers) {
        this.updateHeaders(response, responseValue.headers);
      }

      this.withPath('examples', () => {
        // Responses can have bodies
        if (responseBody !== undefined) {
          this.withPath(contentType, () => {
            let formattedResponseBody = responseBody;

            if (typeof responseBody !== 'string') {
              formattedResponseBody = JSON.stringify(responseBody, null, 2);
            }

            const bodyAsset = new Asset(formattedResponseBody);
            bodyAsset.classes.push('messageBody');

            if (this.generateSourceMap) {
              this.createSourceMap(bodyAsset, this.path);
            }

            response.content.push(bodyAsset);
          });
        }

        // Responses can have schemas in Swagger
        const exampleSchema = responseValue.examples && responseValue.examples.schema;
        const schema = responseValue.schema || exampleSchema;

        if (schema && schema.format !== 'binary') {
          let args;

          if (responseValue.examples && responseValue.examples.schema) {
            args = [5, 'examples', 'schema'];
          } else {
            args = [5, 'schema'];
          }

          this.withSlicedPath(...args.concat([() => {
            this.pushAssets(schema, response, contentType,
              isJsonResponse && responseBody === undefined);
          }]));
        }

        if (statusCode !== 'null') {
          response.statusCode = statusCode;

          if (this.generateSourceMap) {
            this.createSourceMap(response.attributes.get('statusCode'), this.path.slice(0, -1));
          }
        }
      });


      this.handleSwaggerVendorExtensions(response, responseValue);

      return response;
    });
  }

  // Takes in an `payload` element and a list of Swagger headers. Adds
  // the Swagger headers to the headers element in the payload
  updateHeaders(payload, httpHeaders) {
    _.forEach(_.keys(httpHeaders), (headerName) => {
      if (Object.prototype.hasOwnProperty.call(httpHeaders, headerName)) {
        // eslint-disable-next-line no-loop-func
        this.withPath('headers', headerName, () => {
          pushHeaderObject(headerName, httpHeaders[headerName], payload, this);
        });
      }
    });
  }

  // Test whether tags can be treated as resource groups, and if so it sets a
  // group name for each resource (used later to create groups).
  useResourceGroups() {
    const tags = [];

    if (this.swagger.paths) {
      _.forEach(this.swagger.paths, (path) => {
        let tag = null;

        if (path) {
          const operations = _.omitBy(path, isExtension);

          // eslint-disable-next-line consistent-return
          _.forEach(operations, (operation) => {
            if (operation.tags && operation.tags.length) {
              if (operation.tags.length > 1) {
                // Too many tags... each resource can only be in one group!
                return false;
              }

              if (tag === null) {
                [tag] = operation.tags;
              } else if (tag !== operation.tags[0]) {
                // Non-matching tags... can't have a resource in multiple groups!
                return false;
              }
            }
          });
        }

        if (tag) {
          // eslint-disable-next-line no-param-reassign
          path['x-group-name'] = tag;
          tags.push(tag);
        }
      });
    }

    return tags.length > 0;
  }

  // Update the current group by either selecting or creating it.
  updateResourceGroup(name) {
    const { Category, Copy } = this.namespace.elements;

    if (name) {
      this.group = this.api.find(el => el.element === 'category' && el.classes.includes('resourceGroup') && el.title.toValue() === name).first;

      if (!this.group) {
        // TODO: Source maps for these groups. The problem is that the location
        // may not always make sense. Do we point to the tag description,
        // the resource, or the transition?
        this.group = new Category();
        this.group.title = name;
        this.group.classes.push('resourceGroup');

        if (this.swagger.tags && _.isArray(this.swagger.tags)) {
          _.forEach(this.swagger.tags, (tag) => {
            if (tag.name === name && tag.description) {
              this.group.content.push(new Copy(tag.description));
            }

            this.handleExternalDocs(this.group, tag.externalDocs);
          });
        }

        this.api.content.push(this.group);
      }
    }
  }

  /* eslint-disable class-methods-use-this */
  schemaForParameterValue(parameter) {
    const schema = {
      type: parameter.type,
    };

    if (schema.type === 'integer') {
      schema.type = 'number';
    }

    if (parameter.items) {
      schema.items = parameter.items;
    }

    return schema;
  }

  typeForParameter(parameter) {
    const {
      Array: ArrayElement, Boolean: BooleanElement, Number: NumberElement,
      String: StringElement,
    } = this.namespace.elements;

    const types = {
      string: StringElement,
      number: NumberElement,
      integer: NumberElement,
      boolean: BooleanElement,
      array: ArrayElement,
      file: StringElement,
    };

    return types[parameter.type];
  }

  convertValueToElement(value, schema) {
    const validator = new ZSchema();
    let element;

    if (schema.type === 'file') {
      // files don't have types
      return this.namespace.toElement(value);
    }

    if (validator.validate(value, schema)) {
      element = this.namespace.toElement(value);

      if (this.generateSourceMap) {
        this.createSourceMap(element, this.path);
      }
    } else {
      validator.getLastError().details.forEach((detail) => {
        this.createAnnotation(annotations.VALIDATION_WARNING, this.path, detail.message);
      });

      // Coerce parameter to correct type
      if (schema.type === 'string') {
        if (typeof value === 'number' || typeof value === 'boolean') {
          element = new this.namespace.elements.String(String(value));
        }
      }
    }

    return element;
  }

  // Convert a Swagger parameter into a Refract element.
  convertParameterToElement(parameter, setAttributes = false) {
    const { Array: ArrayElement, Enum: EnumElement } = this.namespace.elements;

    const Type = this.typeForParameter(parameter);
    const schema = this.schemaForParameterValue(parameter);

    let element = new Type();

    if (parameter['x-example'] !== undefined) {
      this.withPath('x-example', () => {
        const value = this.convertValueToElement(parameter['x-example'], schema);

        if (value) {
          if (parameter.enum) {
            value.attributes.set('typeAttributes', ['fixed']);
          }

          element = value;
        }
      });
    }

    if (parameter.enum) {
      const enumerations = new ArrayElement();

      parameter.enum.forEach((value, index) => {
        this.withPath('enum', index, () => {
          const enumeration = this.convertValueToElement(value, schema);

          if (enumeration) {
            enumeration.attributes.set('typeAttributes', ['fixed']);
            enumerations.push(enumeration);
          }
        });
      });


      if (enumerations.length > 0) {
        // We should only wrap the existing element in an enumeration
        // iff there was valid enumeations. When there is enuerations
        // and they are all invalid, let's discard the enumeration.
        // The user already got a warning about it which is
        // raised from `convertValueToElement`.

        if (element.toValue()) {
          element = new EnumElement(element);
        } else {
          element = new EnumElement();
        }

        element.enumerations = enumerations;
      }
    }

    if (parameter.default) {
      this.withPath('default', () => {
        let value = this.convertValueToElement(parameter.default, schema);

        if (value) {
          if (parameter.enum) {
            value.attributes.set('typeAttributes', ['fixed']);
            value = new EnumElement(value);
          }

          element.attributes.set('default', value);
        }
      });
    }

    if (parameter.type === 'array' && parameter.items && parameter.items.type && element.content.length === 0) {
      this.withPath('items', () => {
        element.content = [this.convertParameterToElement(parameter.items, true)];
      });
    }

    if (this.generateSourceMap) {
      this.createSourceMap(element, this.path);
    }

    if (setAttributes) {
      if (parameter.description) {
        element.description = parameter.description;

        if (this.generateSourceMap) {
          this.createSourceMap(element.meta.get('description'), this.path.concat(['description']));
        }
      }

      if (parameter.required) {
        element.attributes.set('typeAttributes', ['required']);
      }
    }

    return element;
  }

  // Convert a Swagger parameter into a Refract member element for use in an
  // object element (or subclass).
  convertParameterToMember(parameter) {
    const MemberElement = this.namespace.getElementClass('member');
    const memberValue = this.convertParameterToElement(parameter);
    const member = new MemberElement(parameter.name, memberValue);

    if (this.generateSourceMap) {
      this.createSourceMap(member, this.path);
    }

    if (parameter.description) {
      member.description = parameter.description;

      if (this.generateSourceMap) {
        this.createSourceMap(member.meta.get('description'), this.path.concat(['description']));
      }
    }

    if (parameter.required) {
      member.attributes.set('typeAttributes', ['required']);
    } else {
      member.attributes.set('typeAttributes', ['optional']);
    }

    return member;
  }

  // Make a new source map for the given element
  createSourceMap(element, path, produceLineColumnAttributes) {
    if (this.ast) {
      const NumberElement = this.namespace.elements.Number;
      const SourceMap = this.namespace.getElementClass('sourceMap');
      const position = this.ast.getPosition(path);

      if (position && position.start && position.end
          && !Number.isNaN(position.start.pointer) && !Number.isNaN(position.end.pointer)) {
        const start = new NumberElement(position.start.pointer);
        const end = new NumberElement(position.end.pointer - position.start.pointer);

        if (produceLineColumnAttributes) {
          start.attributes.set('line', position.start.line);
          start.attributes.set('column', position.start.column);
          end.attributes.set('line', position.end.line);
          end.attributes.set('column', position.end.column);
        }

        element.attributes.set('sourceMap', [new SourceMap([[start, end]])]);
      }
    }
  }

  // Create annotation from swagger-parser error (ZSchema validation)
  createValidationAnnotation(error) {
    let message;

    // join array of words
    const oxfordJoin = array => array.map((item, index) => {
      if (index === array.length - 1) {
        return `or '${item}'`;
      }

      return `'${item}'`;
    }).join(', ');

    if (error.code === 'ANY_OF_MISSING'
      && _.last(error.path) === 'type'
      && error.inner.length === 2
      && error.inner[0].code === 'ENUM_MISMATCH'
      && error.inner[1].code === 'INVALID_TYPE'
    ) {
      // Schema Object 'type' validation can contain enum mismatch and type mismatch
      // Prefer only the enum mismatch for less confusing error message
      // Schema is something like the following which causes anyOf validation
      // with two inner validation errors:
      // anyOf:
      //   - enum: ['array', 'number', ...]
      //   - type: ['string', 'array']
      this.createValidationAnnotation(error.inner[0]);
      return;
    }

    if (error.code === 'ONE_OF_MISSING'
      && error.inner.length === 2
      && error.inner[1].code === 'OBJECT_MISSING_REQUIRED_PROPERTY'
      && error.inner[1].params.length === 1 && error.inner[1].params[0] === '$ref') {
      // one of validation error containing $ref, let's skip the ref part of message
      // and only show the "main" branch. The $ref is rarely important aspect of validation.
      this.createValidationAnnotation(error.inner[0]);
      return;
    }

    if (error.code === 'ONE_OF_MISSING'
      && error.inner.every(subError => subError.code === 'OBJECT_MISSING_REQUIRED_PROPERTY')) {
      // collase a collection of "one of" required property validations into one message
      const missingProperties = oxfordJoin(error.inner.map(subError => subError.params[0]));
      message = `Object must contain either ${missingProperties} properties`;
      this.createAnnotation(annotations.VALIDATION_ERROR, error.path, message);
      return;
    }

    if (error.code === 'ENUM_MISMATCH') {
      const enumerations = oxfordJoin(error[ZSchema.schemaSymbol].enum);
      const value = error.params[0];
      message = `Value must be either ${enumerations} not '${value}'`;
    } else {
      ({ message } = error);
    }

    this.createAnnotation(annotations.VALIDATION_ERROR, error.path, message);

    if (error.inner) {
      error.inner.forEach((innerError) => {
        // TODO: I am honestly not sure what the correct behavior is
        // here. Some items will have within them a tree of other items,
        // some of which might contain more info (but it's unclear).
        // Do we treat them as their own error or do something else?
        this.createValidationAnnotation(innerError);
      });
    }
  }

  // Make a new annotation for the given path and message
  createAnnotation(info, path, message) {
    const { Annotation } = this.namespace.elements;

    const annotation = new Annotation(message);
    annotation.classes.push(info.type);
    annotation.code = info.code;

    this.result.content.push(annotation);

    if (info.fragment) {
      origin(info.fragment, annotation, this);
    }

    if (path && this.ast) {
      this.createSourceMap(annotation, path, true);
    }

    return annotation;
  }

  // Create a new HrefVariables element from a parameter list. Returns either
  // the new HrefVariables element or `undefined`.
  createHrefVariables(params) {
    const { HrefVariables } = this.namespace.elements;
    const hrefVariables = new HrefVariables();

    _.forEach(params, (parameter, index) => {
      this.withPath('parameters', index, () => {
        let member;
        const format = parameter.collectionFormat || 'csv';

        // Adding a warning if format is not supported
        if (!['multi', 'csv'].includes(format)) {
          this.createAnnotation(
            annotations.DATA_LOST, this.path,
            `Parameters of collection format '${format}' are not supported`
          );
        }

        if (parameter.in === 'query' || parameter.in === 'path') {
          member = this.convertParameterToMember(parameter);
          hrefVariables.content.push(member);
        }

        return member;
      });
    });

    return hrefVariables.length ? hrefVariables : undefined;
  }

  pushAssets(schema, payload, contentType, pushBody) {
    if (this.bodyCache === undefined) {
      this.bodyCache = {};
    }

    const referencedPathValue = this.referencedPathValue();
    let cacheKey;
    if (referencedPathValue && referencedPathValue.$ref) {
      // schema object with $ref
      cacheKey = `${referencedPathValue.$ref};${contentType}`;
    } else if (
      referencedPathValue
      && referencedPathValue.allOf
      && Object.keys(referencedPathValue).length === 1
      && referencedPathValue.allOf.length === 1
      && referencedPathValue.allOf[0].$ref) {
      // schema object with single ref in allOf (`allOf: [{$ref: path}]`)
      cacheKey = `${referencedPathValue.allOf[0].$ref};${contentType}`;
    }

    if (this.generateMessageBody || this.generateMessageBodySchema) {
      let jsonSchema;
      try {
        const root = { definitions: this.definitions };
        jsonSchema = convertSchema(referencedPathValue || schema, root,
          this.referencedSwagger);
      } catch (error) {
        this.createAnnotation(annotations.VALIDATION_ERROR, this.path, error.message);
        return;
      }

      if (pushBody && this.generateMessageBody) {
        if (cacheKey && this.bodyCache[cacheKey]) {
          const asset = this.bodyCache[cacheKey];
          payload.push(asset.clone());
        } else {
          const asset = bodyFromSchema(jsonSchema, payload, this, contentType);
          if (cacheKey) {
            this.bodyCache[cacheKey] = asset;
          }
        }
      }

      if (this.generateMessageBodySchema) {
        this.pushSchemaAsset(schema, jsonSchema, payload, this.path);
      }
    }

    this.pushDataStructureAsset(referencedPathValue || schema, payload);
  }

  // Create a Refract asset element containing JSON Schema and push into payload
  pushSchemaAsset(schema, jsonSchema, payload, path) {
    const Asset = this.namespace.getElementClass('asset');
    const schemaAsset = new Asset(JSON.stringify(jsonSchema));

    schemaAsset.classes.push('messageBodySchema');
    schemaAsset.contentType = 'application/schema+json';

    if (this.generateSourceMap) {
      this.createSourceMap(schemaAsset, path);
    }

    this.handleExternalDocs(schemaAsset, schema.externalDocs);

    payload.content.push(schemaAsset);
  }

  /** Retrieves the value of the current path in the original Swagger document (referenced document)
   */
  referencedPathValue() {
    let value = this.referencedSwagger;

    this.path.forEach((path) => {
      if (value) {
        value = value[path];
      } else {
        value = null;
      }
    });

    return value;
  }

  pushDataStructureAsset(schema, payload) {
    try {
      const generator = new DataStructureGenerator(this.namespace, this.referencedSwagger);
      const dataStructure = generator.generateDataStructure(schema);
      if (dataStructure) {
        payload.content.push(dataStructure);
      }
    } catch (exception) {
      // TODO: Expose errors once feature is more-complete
    }
  }

  // Create a new Refract transition element with a blank request and response.
  createTransaction(transition, method, schemes) {
    const { HttpRequest, HttpResponse, HttpTransaction } = this.namespace.elements;
    const transaction = new HttpTransaction();
    transaction.content = [new HttpRequest(), new HttpResponse()];

    if (transition) {
      transition.content.push(transaction);
    }

    if (method) {
      transaction.request.method = method.toUpperCase();

      if (this.generateSourceMap) {
        this.createSourceMap(transaction.request.attributes.get('method'), this.path);
      }
    }

    if (schemes.length) {
      transaction.attributes.set('authSchemes', schemes.map(scheme => scheme.clone()));
    }

    return transaction;
  }

  validateProduces(produces) {
    if (produces) {
      this.withPath('produces', () => {
        this.validateContentTypes(produces);
      });
    }
  }

  validateConsumes(consumes) {
    if (consumes) {
      this.withPath('consumes', () => {
        this.validateContentTypes(consumes);
      });
    }
  }

  validateContentTypes(contentTypes) {
    contentTypes.forEach((contentType, index) => {
      try {
        const { type } = contentTypeModule.parse(contentType);
        mediaTyper.parse(type);
      } catch (e) {
        this.withPath(index, () => {
          this.createAnnotation(
            annotations.VALIDATION_WARNING, this.path,
            `Invalid content type '${contentType}', ${e.message}`
          );
        });
      }
    });
  }
}

module.exports = Parser;
