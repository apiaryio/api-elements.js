import _ from 'underscore';
import deref from 'json-schema-deref-sync';
import yaml from 'js-yaml';

export const name = 'swagger20';

// TODO: Figure out media type for Swagger 2.0
export const mediaTypes = [
  'application/swagger+json',
  'application/swagger+yaml'
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
  let member = new MemberElement(parameter.name);
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
  } catch(error) {
    jsonSchema = jsonSchemaWithRefs;
  }

  return jsonSchema;
}

function createAssetFromJsonSchema(minim, jsonSchemaWithRefs) {
  const Asset = minim.getElementClass('asset');
  let jsonSchema = derefJsonSchema(jsonSchemaWithRefs);
  let schemaAsset = new Asset(JSON.stringify(jsonSchema));
  schemaAsset.classes.push('messageBodySchema');
  schemaAsset.attributes.set('contentType', 'application/schema+json');

  return schemaAsset;
}

function createTransaction(minim, transition, method) {
  const HttpTransaction = minim.getElementClass('httpTransaction');
  const HttpRequest = minim.getElementClass('httpRequest');
  const HttpResponse = minim.getElementClass('httpResponse');
  let transaction = new HttpTransaction();
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
  const Resource = minim.getElementClass('resource');
  const Transition = minim.getElementClass('transition');

  const paramToElement = convertParameterToElement.bind(
    convertParameterToElement, minim);

  const swagger = yaml.safeLoad(source);

  let basePath = swagger.basePath || '';
  let schemaDefinitions = _.pick(swagger, 'definitions') || {};

  let api = new Category();

  // Root API Element
  api.classes.push('api');
  api.meta.set('title', swagger.info.title);
  if (swagger.info.description) {
    api.content.push(new Copy(swagger.info.description));
  }

  // Swagger has a paths object to loop through
  // The key is the href
  _.each(swagger.paths, (pathValue, href) => {
    let resource = new Resource();
    api.content.push(resource);

    // TODO: Better title and description for the resources
    // For now, give a title of the HREF
    resource.meta.set('title', 'Resource ' + href);

    let pathObjectParameters = pathValue.parameters || [];

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
    let relevantPaths = _.omit(pathValue, 'parameters', '$ref');

    // Each path is an object with methods as properties
    _.each(relevantPaths, (methodValue, method) => {
      let methodValueParameters = methodValue.parameters || [];

      let queryParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'query';
      });

      // URI parameters are for query and path variables
      let uriParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'query' || parameter.in === 'path';
      });

      // Body parameters are ones that define JSON Schema
      let bodyParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'body';
      });

      // Query parameters are added the HREF if they exist
      if (queryParameters.length > 0) {
        let queryParameterNames = queryParameters.map((parameter) => {
          return parameter.name;
        });

        resource.attributes.set('href', basePath + href + '{?' + queryParameterNames.join(',') + '}');
      } else {
        resource.attributes.set('href', href);
      }

      let transition = new Transition();
      resource.content.push(transition);

      // Prefer description over summary since description is more complete.
      // According to spec, summary SHOULD only be 120 characters
      let transitionDescription = methodValue.description ?
        methodValue.description : methodValue.summary;
      if (transitionDescription) {
        transition.push(new Copy(transitionDescription));
      }

      if (methodValue.operationId) {
        transition.meta.set('title', methodValue.operationId);
      }

      // For each uriParameter, create an hrefVariable
      if (uriParameters.length > 0) {
        transition.hrefVariables = new HrefVariables();

        uriParameters
          .map(paramToElement)
          .forEach((member) => transition.hrefVariables.content.push(member));
      }

      // Currently, default responses are not supported in API Description format
      let relevantResponses = _.omit(methodValue.responses, 'default');

      if (_.keys(relevantResponses).length === 0) {
        createTransaction(minim, transition, method);
      }

      // Transactions are created for each response in the document
      _.each(relevantResponses, (responseValue, statusCode) => {
        let examples = {
          '': undefined
        };

        if (responseValue.examples) {
          examples = responseValue.examples;
        }

        examples = _.omit(examples, 'schema');

        _.each(examples, (responseBody, contentType) => {
          let transaction = createTransaction(minim, transition, method);
          let request = transaction.request;
          let response = transaction.response;

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
            let jsonSchemaWithDefinitions = _.extend({}, bodyParameter.schema, schemaDefinitions);
            let schemaAsset = createAssetFromJsonSchema(minim, jsonSchemaWithDefinitions);
            request.content.push(schemaAsset);
          });

          // Responses can have bodies
          if (responseBody !== undefined) {
            const bodyAsset = new Asset(JSON.stringify(responseBody, null, 2));
            bodyAsset.classes.push('messageBody');
            response.content.push(bodyAsset);
          }

          // Responses can have schemas in Swagger
          let schema = responseValue.schema || (responseValue.examples && responseValue.examples.schema);
          if (schema) {
            let jsonSchemaWithDefinitions = _.extend({}, schema, schemaDefinitions);
            let schemaAsset = createAssetFromJsonSchema(minim, jsonSchemaWithDefinitions);
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

  done(null, api);
}


/*
 * Serialize an API into Swagger 2.0.
 */
export function serialize({api, minim}, done) {
  // TODO: Implement Swagger 2.0 serializer
  done(new Error('Not implemented yet!'));
}
