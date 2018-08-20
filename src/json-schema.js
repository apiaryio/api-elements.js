import _ from 'lodash';

// Test whether a key is a special Swagger extension.
function isExtension(value, key) {
  return _.startsWith(key, 'x-');
}

function convertSubSchema(schema) {
  let actualSchema = _.omit(schema, ['discriminator', 'readOnly', 'xml', 'externalDocs', 'example']);
  actualSchema = _.omitBy(actualSchema, isExtension);

  if (schema.example) {
    actualSchema.examples = [schema.example];
  }

  if (schema['x-nullable']) {
    if (actualSchema.type) {
      actualSchema.type = [actualSchema.type, 'null'];
    } else if (actualSchema.enum === undefined) {
      actualSchema.type = 'null';
    }

    if (actualSchema.enum && !actualSchema.enum.includes(null)) {
      actualSchema.enum.push(null);
    }
  }

  if (schema.allOf) {
    actualSchema.allOf = schema.allOf.map(convertSubSchema);
  }

  if (schema.anyOf) {
    actualSchema.anyOf = schema.anyOf.map(convertSubSchema);
  }

  if (schema.oneOf) {
    actualSchema.oneOf = schema.oneOf.map(convertSubSchema);
  }

  if (schema.not) {
    actualSchema.not = convertSubSchema(schema.not);
  }

  // Array

  if (schema.items) {
    if (Array.isArray(schema.items)) {
      actualSchema.items = schema.items.map(convertSubSchema);
    } else {
      actualSchema.items = convertSubSchema(schema.items);
    }
  }

  if (schema.additionalItems && typeof schema.additionalItems === 'object') {
    actualSchema.additionalItems = convertSubSchema(schema.additionalItems);
  }

  // Object

  if (schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      actualSchema.properties[key] = convertSubSchema(schema.properties[key]);
    });
  }

  if (schema.patternProperties) {
    Object.keys(schema.patternProperties).forEach((key) => {
      actualSchema.patternProperties[key] = convertSubSchema(schema.patternProperties[key]);
    });
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    actualSchema.additionalProperties = convertSubSchema(schema.additionalProperties);
  }

  return actualSchema;
}

/** Convert Swagger schema to JSON Schema
 */
export default function convertSchema(schema) {
  return convertSubSchema(schema);
}
