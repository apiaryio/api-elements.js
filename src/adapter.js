import _ from 'underscore';
import $RefParser from 'json-schema-ref-parser';
import yaml from 'js-yaml';
import buildUriTemplate from './uri-template';

export const name = 'swagger';

// TODO: Figure out media type for Swagger 2.0
export const mediaTypes = [
  'application/swagger+json',
  'application/swagger+yaml',
];

export function detect(source) {
  return !!(_.isString(source)
    ? source.match(/"?swagger"?:\s*["']2\.0["']/g)
    : source.swagger === '2.0');
}

// Test whether a key is a special Swagger extension.
function isExtension(value, key) {
  return key.indexOf('x-') === 0;
}

function convertParameterToElement(minim, parameter) {
  const StringElement = minim.getElementClass('string');
  const NumberElement = minim.getElementClass('number');
  const BooleanElement = minim.getElementClass('boolean');
  const ArrayElement = minim.getElementClass('array');
  const MemberElement = minim.getElementClass('member');

  let memberValue;

  // Convert from Swagger types to Minim elements
  if (parameter.type === 'string') {
    memberValue = new StringElement('');
  } else if (parameter.type === 'integer' || parameter.type === 'number') {
    memberValue = new NumberElement();
  } else if (parameter.type === 'boolean') {
    memberValue = new BooleanElement();
  } else if (parameter.type === 'array') {
    memberValue = new ArrayElement();
  } else {
    // Default to a string in case we get a type we haven't seen
    memberValue = new StringElement('');
  }

  // TODO: Update when Minim has better support for elements as values
  // should be: new MemberType(parameter.name, memberValue);
  const member = new MemberElement(parameter.name);
  member.content.value = memberValue;

  if (parameter.description) {
    member.description = parameter.description;
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

function createAssetFromJsonSchema(minim, jsonSchema) {
  const Asset = minim.getElementClass('asset');
  const schemaAsset = new Asset(JSON.stringify(jsonSchema));
  schemaAsset.classes.push('messageBodySchema');
  schemaAsset.attributes.set('contentType', 'application/schema+json');

  return schemaAsset;
}

function createTransaction(minim, transition, method) {
  const HttpTransaction = minim.getElementClass('httpTransaction');
  const HttpRequest = minim.getElementClass('httpRequest');
  const HttpResponse = minim.getElementClass('httpResponse');
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

/*
 * Parse Swagger 2.0 into Refract elements
 */
export function parse({minim, source}, done) {
  // TODO: Will refactor this once API Description namespace is stable
  // Leaving as large block of code until then
  const Asset = minim.getElementClass('asset');
  const Copy = minim.getElementClass('copy');
  const Category = minim.getElementClass('category');
  const HrefVariables = minim.getElementClass('hrefVariables');
  const HttpHeaders = minim.getElementClass('httpHeaders');
  const MemberElement = minim.getElementClass('member');
  const ParseResult = minim.getElementClass('parseResult');
  const Resource = minim.getElementClass('resource');
  const Transition = minim.getElementClass('transition');

  const paramToElement = convertParameterToElement.bind(
    convertParameterToElement, minim);

  const loaded = _.isString(source) ? yaml.safeLoad(source) : source;

  $RefParser.dereference(loaded, (err, swagger) => {
    if (err) {
      return done(err);
    }
    const basePath = swagger.basePath || '';

    const parseResult = new ParseResult();
    const api = new Category();
    parseResult.push(api);

    // Root API Element
    api.classes.push('api');

    if (swagger.info) {
      if (swagger.info.title) {
        api.meta.set('title', swagger.info.title);
      }

      if (swagger.info.description) {
        api.content.push(new Copy(swagger.info.description));
      }
    }

    if (swagger.host) {
      let hostname = swagger.host;

      if (swagger.schemes) {
        if (swagger.schemes.length > 1) {
          // TODO: [Annotation] Add warning about unused schemes!
        }

        hostname = `${swagger.schemes[0]}://${hostname}`;
      }

      api.attributes.set('meta', {});
      const meta = api.attributes.get('meta');
      const member = new MemberElement('HOST', hostname);
      member.meta.set('classes', ['user']);
      meta.content.push(member);
    }

    // Swagger has a paths object to loop through
    // The key is the href
    _.each(_.omit(swagger.paths, isExtension), (pathValue, href) => {
      const resource = new Resource();
      api.content.push(resource);

      const pathObjectParameters = pathValue.parameters || [];

      // TODO: Currently this only supports URI parameters for `path` and `query`.
      // It should add support for `body` parameters as well.
      // TODO: [Annotation] Warn user that body parameters are not used if found
      if (pathObjectParameters.length > 0) {
        resource.hrefVariables = new HrefVariables();

        pathObjectParameters
          .filter((parameter) => parameter.in === 'query' || parameter.in === 'path')
          .map(paramToElement)
          .forEach((member) => resource.hrefVariables.content.push(member));
      }

      // TODO: Handle parameters on a resource level
      // See https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#path-item-object
      const relevantPaths = _.chain(pathValue)
        .omit('parameters', '$ref')
        .omit(isExtension)
        .value();

      // Each path is an object with methods as properties
      _.each(relevantPaths, (methodValue, method) => {
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

        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
        resource.attributes.set('href', hrefForResource);

        const transition = new Transition();
        resource.content.push(transition);

        if (methodValue.summary) {
          transition.meta.set('title', methodValue.summary);
        }

        if (methodValue.description) {
          transition.push(new Copy(methodValue.description));
        }

        if (methodValue.operationId) {
          transition.attributes.set('relation', methodValue.operationId);
        }

        // For each uriParameter, create an hrefVariable
        if (uriParameters.length > 0) {
          transition.hrefVariables = new HrefVariables();

          uriParameters
            .map(paramToElement)
            .forEach((member) => transition.hrefVariables.content.push(member));
        }

        // Currently, default responses are not supported in API Description format
        // TODO: [Annotation] Add warning about not showing the default!
        const relevantResponses = _.chain(methodValue.responses)
          .omit('default')
          .omit(isExtension)
          .value();

        if (_.keys(relevantResponses).length === 0) {
          createTransaction(minim, transition, method);
        }

        // Transactions are created for each response in the document
        _.each(relevantResponses, (responseValue, statusCode) => {
          let examples = {
            '': undefined,
          };

          if (responseValue.examples) {
            examples = responseValue.examples;
          }

          examples = _.omit(examples, 'schema');

          _.each(examples, (responseBody, contentType) => {
            const transaction = createTransaction(minim, transition, method);
            const request = transaction.request;
            const response = transaction.response;

            if (responseValue.description) {
              response.content.push(new Copy(responseValue.description));
            }

            const headers = new HttpHeaders();

            if (contentType) {
              headers.push(new MemberElement(
                'Content-Type', contentType
              ));

              response.headers = headers;
            }

            if (responseValue.headers) {
              for (const headerName in responseValue.headers) {
                if (responseValue.headers.hasOwnProperty(headerName)) {
                  const header = responseValue.headers[headerName];
                  let value = '';

                  // Choose the first available option
                  if (header.enum) {
                    value = header.enum[0];
                  }

                  if (header.default) {
                    value = header.default;
                  }

                  const member = new MemberElement(headerName, value);

                  if (header.description) {
                    member.meta.set('description', header.description);
                  }

                  headers.push(member);
                }
              }

              response.headers = headers;
            }

            // Body parameters define request schemas
            _.each(bodyParameters, (bodyParameter) => {
              const schemaAsset = createAssetFromJsonSchema(minim, bodyParameter.schema);
              request.content.push(schemaAsset);
            });

            // Responses can have bodies
            if (responseBody !== undefined) {
              const bodyAsset = new Asset(JSON.stringify(responseBody, null, 2));
              bodyAsset.classes.push('messageBody');
              response.content.push(bodyAsset);
            }

            // Responses can have schemas in Swagger
            const schema = responseValue.schema || (responseValue.examples && responseValue.examples.schema);
            if (schema) {
              const schemaAsset = createAssetFromJsonSchema(minim, schema);
              response.content.push(schemaAsset);
            }

            // TODO: Decide what to do with request hrefs
            // If the URI is templated, we don't want to add it to the request
            // if (uriParameters.length === 0) {
            //   request.attributes.href = href;
            // }

            response.attributes.set('statusCode', statusCode);
          });
        });
      });
    });

    done(null, parseResult);
  });
}

export default {name, mediaTypes, detect, parse};
