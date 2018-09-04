import _ from 'lodash';

// Test whether a key is a special Swagger extension.
function isExtension(value, key) {
  return _.startsWith(key, 'x-');
}

function convertSubSchema(schema, references) {
  if (schema.$ref) {
    references.push(schema.$ref);
    return { $ref: schema.$ref };
  }

  let actualSchema = _.omit(schema, ['discriminator', 'readOnly', 'xml', 'externalDocs', 'example']);
  actualSchema = _.omitBy(actualSchema, isExtension);

  if (schema.type === 'file') {
    // file is not a valid JSON Schema type let's pick string instead
    actualSchema.type = 'string';
  }

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
    actualSchema.allOf = schema.allOf.map(s => convertSubSchema(s, references));
  }

  if (schema.anyOf) {
    actualSchema.anyOf = schema.anyOf.map(s => convertSubSchema(s, references));
  }

  if (schema.oneOf) {
    actualSchema.oneOf = schema.oneOf.map(s => convertSubSchema(s, references));
  }

  if (schema.not) {
    actualSchema.not = convertSubSchema(schema.not, references);
  }

  // Array

  if (schema.items) {
    if (Array.isArray(schema.items)) {
      actualSchema.items = schema.items.map(s => convertSubSchema(s, references));
    } else {
      actualSchema.items = convertSubSchema(schema.items, references);
    }
  }

  if (schema.additionalItems && typeof schema.additionalItems === 'object') {
    actualSchema.additionalItems = convertSubSchema(schema.additionalItems, references);
  }

  // Object

  if (schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      actualSchema.properties[key] = convertSubSchema(schema.properties[key], references);
    });
  }

  if (schema.patternProperties) {
    Object.keys(schema.patternProperties).forEach((key) => {
      actualSchema.patternProperties[key] =
        convertSubSchema(schema.patternProperties[key], references);
    });
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    actualSchema.additionalProperties = convertSubSchema(schema.additionalProperties, references);
  }

  return actualSchema;
}

function lookupReference(reference, root) {
  const parts = reference.split('/');

  if (parts[0] !== '#') {
    throw new Error('Schema reference must start with document root (#)');
  }

  if (parts[1] !== 'definitions' || parts.length !== 3) {
    throw new Error('Schema reference must be reference to #/definitions');
  }

  const id = parts[2];

  if (!root.definitions || !root.definitions[id]) {
    throw new Error(`Reference to ${reference} does not exist`);
  }

  return {
    id,
    referenced: root.definitions[id],
  };
}

/** Returns true if the given schema contains any references
 */
function checkSchemaHasReferences(schema) {
  if (schema.$ref) {
    return true;
  }

  return Object.values(schema).some((value) => {
    if (_.isArray(value)) {
      return value.some(checkSchemaHasReferences);
    } else if (_.isObject(value)) {
      return checkSchemaHasReferences(value);
    }

    return false;
  });
}

/** Convert Swagger schema to JSON Schema
 */
export default function convertSchema(schema, root) {
  const references = [];
  const result = convertSubSchema(schema, references);

  if (references.length !== 0) {
    result.definitions = {};
  }

  while (references.length !== 0) {
    const lookup = lookupReference(references.pop(), root);

    if (result.definitions[lookup.id] === undefined) {
      result.definitions[lookup.id] = convertSubSchema(lookup.referenced, references);
    }
  }

  if (result.$ref) {
    const reference = lookupReference(result.$ref, root);

    if (!checkSchemaHasReferences(result.definitions[reference.id])) {
      // Dereference the root reference if possible
      return result.definitions[reference.id];
    }

    // Wrap any root reference in allOf because faker will end up in
    // loop with root references which is avoided with allOf
    return {
      allOf: [{ $ref: result.$ref }],
      definitions: result.definitions,
    };
  }

  return result;
}
