import _ from 'underscore';
import deref from 'json-schema-deref-sync';
import yaml from 'js-yaml';

export const name = 'swagger';

// TODO: Figure out media type for Swagger 2.0
export const mediaTypes = [
  'application/swagger+json',
  'application/swagger+yaml',
];

export function detect(source) {
  return !!source.match(/"?swagger"?:\s*["']2\.0["']/g);
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

  member.description = parameter.description;

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

function derefJsonSchema(jsonSchemaWithRefs) {
  let jsonSchema;

  // In case there are errors with `deref`, which can happen with circular $refs
  try {
    jsonSchema = deref(jsonSchemaWithRefs);
  } catch (error) {
    jsonSchema = jsonSchemaWithRefs;
  }

  return jsonSchema;
}

function createAssetFromJsonSchema(minim, jsonSchemaWithRefs) {
  const Asset = minim.getElementClass('asset');
  const jsonSchema = derefJsonSchema(jsonSchemaWithRefs);
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

  const swagger = yaml.safeLoad(source);

  const basePath = swagger.basePath || '';
  const schemaDefinitions = _.pick(swagger, 'definitions') || {};

  const parseResult = new ParseResult();
  const api = new Category();
  parseResult.push(api);

  // Root API Element
  api.classes.push('api');
  api.meta.set('title', swagger.info.title);
  if (swagger.info.description) {
    api.content.push(new Copy(swagger.info.description));
  }

  // Swagger has a paths object to loop through
  // The key is the href
  _.each(swagger.paths, (pathValue, href) => {
    const resource = new Resource();
    api.content.push(resource);

    const pathObjectParameters = pathValue.parameters || [];

    // TODO: Currently this only supports URI parameters for `path` and `query`.
    // It should add support for `body` parameters as well.
    if (pathObjectParameters.length > 0) {
      resource.hrefVariables = new HrefVariables();

      pathObjectParameters
        .filter((parameter) => parameter.in === 'query' || parameter.in === 'path')
        .map(paramToElement)
        .forEach((member) => resource.hrefVariables.content.push(member));
    }

    // TODO: Handle parameters on a resource level
    // See https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#path-item-object
    const relevantPaths = _.omit(pathValue, 'parameters', '$ref');

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

      // Query parameters are added the HREF if they exist
      if (queryParameters.length > 0) {
        const queryParameterNames = queryParameters.map((parameter) => {
          return parameter.name;
        });

        resource.attributes.set('href', basePath + href + '{?' + queryParameterNames.join(',') + '}');
      } else {
        resource.attributes.set('href', href);
      }

      const transition = new Transition();
      resource.content.push(transition);

      transition.meta.set('title', methodValue.summary || methodValue.operationId || '');

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
      const relevantResponses = _.omit(methodValue.responses, 'default');

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

          if (contentType) {
            const headers = new HttpHeaders();

            headers.push(new MemberElement(
              'Content-Type', contentType
            ));

            response.headers = headers;
          }

          // Body parameters define request schemas
          _.each(bodyParameters, (bodyParameter) => {
            const jsonSchemaWithDefinitions = _.extend({}, bodyParameter.schema, schemaDefinitions);
            const schemaAsset = createAssetFromJsonSchema(minim, jsonSchemaWithDefinitions);
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
            const jsonSchemaWithDefinitions = _.extend({}, schema, schemaDefinitions);
            const schemaAsset = createAssetFromJsonSchema(minim, jsonSchemaWithDefinitions);
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
}

export default {name, mediaTypes, detect, parse};
