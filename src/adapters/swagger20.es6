import _ from 'underscore';
import deref from 'json-schema-deref-sync';

import { registry, MemberType, BooleanType, NumberType, StringType } from 'minim';
import '../refract/api';

// Define API Description elements
const Category = registry.getElementClass('category');
const Resource = registry.getElementClass('resource');
const Transition = registry.getElementClass('transition');
const HttpTransaction = registry.getElementClass('httpTransaction');
const HttpRequest = registry.getElementClass('httpRequest');
const HttpResponse = registry.getElementClass('httpResponse');
const HrefVariables = registry.getElementClass('hrefVariables');
const Asset = registry.getElementClass('asset');

export const name = 'swagger20';

// TODO: Figure out media type for Swagger 2.0
export const mediaTypes = ['application/swagger+json'];

export function detect(source) {
  return source.swagger === '2.0';
}

function convertParameterToElement(parameter) {
  let memberValue;

  // Convert from Swagger types to Minim elements
  if (parameter.type === 'string') {
    memberValue = new StringType('');
  } else if (parameter.type === 'integer' || parameter.type === 'number') {
    memberValue = new NumberType();
  } else if (parameter.type === 'boolean') {
    memberValue = new BooleanType();
  }

  // TODO: Update when Minim has better support for elements as values
  // should be: new MemberType(parameter.name, memberValue);
  let member = new MemberType(parameter.name);
  member.content.value = memberValue;

  member.meta.description = parameter.description;

  if (parameter.required) {
    member.attributes.typeAttributes = ['required'];
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

function createAssetFromJsonSchema(jsonSchemaWithRefs) {
  let jsonSchema = derefJsonSchema(jsonSchemaWithRefs);
  let schemaAsset = new Asset(JSON.stringify(jsonSchema));
  schemaAsset.meta.class.push('messageBodySchema');
  schemaAsset.attributes.contentType = 'application/schema+json';

  return schemaAsset;
}

/*
 * Parse Swagger 2.0 into Refract elements
 */
export function parse({ source }, done) {
  // TODO: Will refactor this once API Description namespace is stable
  // Leaving as large block of code until then
  let basePath = source.basePath || '';
  let schemaDefinitions = _.pick(source, 'definitions') || {};

  let api = new Category();

  // Root API Element
  api.meta.class.push('api');
  api.meta.title.set(source.info.title);
  api.meta.description.set(source.info.description);

  // Swagger has a paths object to loop through
  // The key is the href
  _.each(source.paths, (pathValue, href) => {
    let resource = new Resource();
    api.content.push(resource);

    // TODO: Better title and description for the resources
    // For now, give a title of the HREF
    resource.meta.title.set('Resource ' + href);

    let pathObjectParameters = pathValue.parameters || [];

    // TODO: Currently this only supports URI parameters for `path` and `query`.
    // It should add support for `body` parameters as well.
    if (pathObjectParameters.length > 0) {
      resource.hrefVariables = new HrefVariables();

      pathObjectParameters
        .filter((parameter) => parameter.in === 'query' || parameter.in === 'path')
        .map(convertParameterToElement)
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

        resource.attributes.href = basePath + href + '{?' + queryParameterNames.join(',') + '}';
      } else {
        resource.attributes.href = href;
      }

      let transition = new Transition();
      resource.content.push(transition);

      // Prefer description over summary since description is more complete.
      // According to spec, summary SHOULD only be 120 characters
      if (methodValue.description) {
        transition.meta.description.set(methodValue.description);
      } else if (methodValue.summary) {
        transition.meta.description.set(methodValue.summary);
      }

      transition.meta.title.set(methodValue.operationId);

      // For each uriParameter, create an hrefVariable
      if (uriParameters.length > 0) {
        transition.parameters = new HrefVariables();

        uriParameters
          .map(convertParameterToElement)
          .forEach((member) => transition.parameters.content.push(member));
      }

      // Currently, default responses are not supported in API Description format
      let relevantResponses = _.omit(methodValue.responses, 'default');

      // Transactions are created for each response in the document
      _.each(relevantResponses, (responseValue, statusCode) => {
        let transaction = new HttpTransaction();
        transition.content.push(transaction);

        let request = new HttpRequest();
        let response = new HttpResponse();
        transaction.content = [request, response];

        request.attributes.method = method.toUpperCase();

        // Body parameters define request schemas
        _.each(bodyParameters, function(bodyParameter) {
          let jsonSchemaWithDefinitions = _.extend({}, bodyParameter.schema, schemaDefinitions);
          let schemaAsset = createAssetFromJsonSchema(jsonSchemaWithDefinitions);
          request.content.push(schemaAsset);
        });

        // Responses can have schemas in Swagger
        if (responseValue.schema) {
          let jsonSchemaWithDefinitions = _.extend({}, responseValue.schema, schemaDefinitions);
          let schemaAsset = createAssetFromJsonSchema(jsonSchemaWithDefinitions);
          response.content.push(schemaAsset);
        }

        // TODO: Decide what to do with request hrefs
        // If the URI is templated, we don't want to add it to the request
        // if (uriParameters.length === 0) {
        //   request.attributes.href = href;
        // }

        response.attributes.statusCode = statusCode;
      });
    });
  });

  done(null, api);
}


/*
 * Serialize an API into Swagger 2.0.
 */
export function serialize({ api }, done) {
  // TODO: Implement Swagger 2.0 serializer
  done(new Error('Not implemented yet!'));
}
