import _ from 'lodash';

// Test whether a key is a special Swagger extension.
function isExtension(value, key) {
  return _.startsWith(key, 'x-');
}

/** Convert Swagger schema to JSON Schema
 */
export default function convertSchema(schema) {
  let actualSchema = _.omit(schema, ['discriminator', 'readOnly', 'xml', 'externalDocs', 'example']);
  actualSchema = _.omitBy(actualSchema, isExtension);

  if (schema['x-nullable']) {
    if (actualSchema.type) {
      actualSchema.type = [actualSchema.type, 'null'];
    } else {
      actualSchema.type = 'null';
    }
  }

  return actualSchema;
}
