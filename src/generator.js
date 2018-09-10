import _ from 'lodash';
import querystring from 'querystring';
import faker from 'json-schema-faker';
import annotations from './annotations';
import { inferred } from './link';
import { isFormURLEncoded, isMultiPartFormData, parseBoundary } from './media-type';

faker.option({
  alwaysFakeOptionals: true,
  useDefaultValue: true,
  maxItems: 5,
  maxLength: 256,
});

function hasCircularReference(schema) {
  // Primitive implementation, right now only schemas with definitions are circular
  return schema.definitions !== undefined;
}

export function bodyFromSchema(schema, payload, parser, contentType = 'application/json') {
  const { Asset } = parser.minim.elements;
  let asset = null;

  try {
    let body;

    if (schema.examples && schema.examples[0]) {
      body = schema.examples[0];
    } else {
      faker.option({
        alwaysFakeOptionals: !hasCircularReference(schema),
      });

      body = faker(schema);
    }

    if (typeof body !== 'string') {
      if (isFormURLEncoded(contentType)) {
        // Form data
        // TODO: check for arrays etc.
        body = querystring.stringify(body);
      } else if (isMultiPartFormData(contentType)) {
        const boundary = parseBoundary(contentType);
        let content = '';

        _.forEach(body, (value, key) => {
          content += `--${boundary}\r\n`;
          content += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
          content += `${value}\r\n`;
        });

        content += `\r\n--${boundary}--\r\n`;

        body = content;
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
    parser.createAnnotation(
      annotations.DATA_LOST, parser.path,
      `Unable to generate ${contentType} example message body out of JSON Schema`,
    );
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
    paramSchema.default = param['x-example'];
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
