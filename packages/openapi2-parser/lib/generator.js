const _ = require('lodash');
const querystring = require('querystring');
const faker = require('json-schema-faker');
const { dereference } = require('./json-schema');
const annotations = require('./annotations');
const { inferred } = require('./link');
const { isFormURLEncoded, isMultiPartFormData, parseBoundary } = require('./media-type');

faker.option({
  failOnInvalidFormat: false,
  fixedProbabilities: true,
  optionalsProbability: 1.0,
  useExamplesValue: true,
  useDefaultValue: true,
  maxItems: 5,
  maxLength: 256,
  random: () => 0,
});

const schemaIsArrayAndHasItems = schema => schema.type && schema.type === 'array' && schema.items;
const isEmptyArray = value => value && Array.isArray(value) && value.length === 0;

function generateBody(schema) {
  if (schema.allOf && schema.allOf.length === 1 && schema.allOf[0].examples && schema.allOf[0].examples.length > 0) {
    return schema.allOf[0].examples[0];
  }

  if (schema.examples && schema.examples.length > 0) {
    return schema.examples[0];
  }

  const body = faker.generate(schema);

  if (isEmptyArray(body) && schemaIsArrayAndHasItems(schema)) {
    // Faker failed to generate array schema, pass it `items` and wrap in array ourselves
    return [faker.generate(schema.items)];
  }

  return body;
}

const bodyFromSchema = (schema, payload, parser, contentType = 'application/json') => {
  const dereferencedSchema = dereference(schema, schema);
  const { Asset } = parser.namespace.elements;
  let asset = null;

  try {
    let body = generateBody(dereferencedSchema);

    if (typeof body !== 'string') {
      if (isFormURLEncoded(contentType)) {
        // Form data
        // TODO: check for arrays etc.
        body = querystring.stringify(body);
      } else if (isMultiPartFormData(contentType)) {
        const boundary = parseBoundary(contentType);
        let content = '';

        _.forOwn(body, (value, key) => {
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
      `Unable to generate ${contentType} example message body out of JSON Schema`
    );
  }

  return asset;
};

// Generates body asset from formData parameters.
const bodyFromFormParameter = (param, schema) => {
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
};

module.exports = { bodyFromSchema, bodyFromFormParameter };
