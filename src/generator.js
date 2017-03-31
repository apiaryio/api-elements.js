import _ from 'lodash';
import querystring from 'querystring';
import faker from 'json-schema-faker';
import annotations from './annotations';
import { inferred } from './link';

faker.option({
  useDefaultValue: true,
  maxItems: 5,
  maxLength: 256,
});

export function bodyFromSchema(schema, payload, parser, contentType = 'application/json') {
  const { Asset } = parser.minim.elements;
  let asset = null;

  try {
    let body = schema.example || faker(schema);

    if (typeof body !== 'string') {
      if (contentType.indexOf('x-www-form-urlencoded') !== -1) {
        // Form data
        // TODO: check for arrays etc.
        body = querystring.stringify(body);
      } else {
        // JSON
        body = JSON.stringify(body, null, 2);
      }
    }

    asset = new Asset(body);

    asset.classes.push('messageBody');
    asset.contentType = contentType;

    inferred('message-body-generation', asset, parser);

    payload.content.push(asset);
  } catch (exception) {
    parser.createAnnotation(annotations.DATA_LOST, parser.path,
      `Unable to generate ${contentType} example message body out of JSON Schema`);
  }

  return asset;
}

// Generates body asset from formData parameters.
export function bodyFromFormParameter(param, schema) {
  // Preparing throwaway schema. Later we will feed the 'bodyFromSchema'
  // with it.
  const paramSchema = _.clone(param);
  const retSchema = _.clone(schema);

  // If there's example value, we want to force the body generator
  // to use it. This is done using 'enum' with a single value.
  if (param['x-example'] !== undefined) {
    paramSchema.enum = [param['x-example']];
  }

  delete paramSchema.name;
  delete paramSchema.in;
  delete paramSchema.format;
  delete paramSchema.required;
  delete paramSchema['x-example'];
  delete paramSchema.collectionFormat;
  delete paramSchema.allowEmptyValue; // allowEmptyValue is not supported yet
  delete paramSchema.items; // arrays are not supported yet

  retSchema.properties[param.name] = paramSchema;

  if (param.required) {
    retSchema.required.push(param.name);
  }

  return retSchema;
}

export default { bodyFromSchema, bodyFromFormParameter };
