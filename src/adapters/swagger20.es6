import _ from 'underscore';
import deref from 'json-schema-deref-sync';

import {
  registry, MemberElement, BooleanElement, NumberElement, StringElement,
  ArrayElement
} from 'minim';
import '../refract/api';

// Define API Description elements
const Copy = registry.getElementClass('copy');
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

function createAssetFromJsonSchema(jsonSchemaWithRefs) {
  let jsonSchema = derefJsonSchema(jsonSchemaWithRefs);
  let schemaAsset = new Asset(JSON.stringify(jsonSchema));
  schemaAsset.classes.push('messageBodySchema');
  schemaAsset.attributes.set('contentType', 'application/schema+json');

  return schemaAsset;
}

function createTransaction(transition, method) {
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
export function parse({ source }, done) {
  // TODO: Will refactor this once API Description namespace is stable
  // Leaving as large block of code until then
  let basePath = source.basePath || '';
  let schemaDefinitions = _.pick(source, 'definitions') || {};

  let api = new Category();

  // Root API Element
  api.classes.push('api');
  api.meta.set('title', source.info.title);
  if (source.info.description) {
    api.content.push(new Copy(source.info.description));
  }

  // Swagger has a paths object to loop through
  // The key is the href
  _.each(source.paths, (pathValue, href) => {
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

      transition.meta.set('title', methodValue.operationId);

      // For each uriParameter, create an hrefVariable
      if (uriParameters.length > 0) {
        transition.hrefVariables = new HrefVariables();

        uriParameters
          .map(convertParameterToElement)
          .forEach((member) => transition.hrefVariables.content.push(member));
      }

      // Currently, default responses are not supported in API Description format
      let relevantResponses = _.omit(methodValue.responses, 'default');

      if (_.keys(relevantResponses).length === 0) {
        createTransaction(transition, method);
      }

      // Transactions are created for each response in the document
      _.each(relevantResponses, (responseValue, statusCode) => {
        let transaction = createTransaction(transition, method);
        let request = transaction.request;
        let response = transaction.response;

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

        response.attributes.set('statusCode', statusCode);
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
