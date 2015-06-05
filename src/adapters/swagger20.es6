import _ from 'underscore';

import { registry, MemberType } from 'minim';
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

    // Each path is an object with methods as properties
    _.each(pathValue, (methodValue, method) => {
      let methodValueParameters = methodValue.parameters || [];

      let queryParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'query';
      });

      // URI parameters are for query and path variables
      let uriParameters = methodValueParameters.filter((parameter) => {
        return parameter.in === 'query' || parameter.in === 'path';
      });

      // Body parameters are ones that define JSON Schema
      let bodyParameter = _.first(
        methodValueParameters.filter((parameter) => {
          return parameter.in === 'body';
        })
      );

      // Query parameters are added the HREF if they exist
      if (queryParameters.length > 0) {
        let queryParameterNames = queryParameters.map((parameter) => {
          return parameter.name;
        });

        resource.attributes.href = basePath + href + '{?' + queryParameterNames.join(',') + '}';
      } else {
        resource.attributes.href = href;
      }

      // For each uriParameter, create an hrefVariable
      if (uriParameters.length > 0) {
        resource.hrefVariables = new HrefVariables();

        _.each(queryParameters, (parameter) => {
          // TODO: allow for multiple types
          // Currently only allows for strings
          let member = new MemberType(parameter.name, '');
          resource.hrefVariables.content.push(member);

          if (parameter.required) {
            member.attributes.typeAttributes = ['required'];
          }
        });
      }

      let transition = new Transition();
      resource.content.push(transition);

      transition.meta.description.set(methodValue.summary);
      transition.meta.title.set(methodValue.operationId);

      let schemaAsset;

      // Body parameters define schema
      if (bodyParameter) {
        schemaAsset = new Asset(JSON.stringify(_.extend({}, bodyParameter.schema, schemaDefinitions)));
        schemaAsset.meta.class.push('messageBodySchema');
        schemaAsset.attributes.contentType = 'application/schema+json';
      }

      // Transactions are created for each response in the document
      _.each(methodValue.responses, (responseValue, statusCode) => {
        let transaction = new HttpTransaction();
        transition.content.push(transaction);

        let request = new HttpRequest();
        let response = new HttpResponse();
        transaction.content = [request, response];

        request.attributes.method = method.toUpperCase();

        if (schemaAsset) {
          request.content.push(schemaAsset);
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
