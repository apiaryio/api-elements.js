import _ from 'lodash';

// Test whether a key is a special Swagger extension.
function isExtension(value, key) {
  return _.startsWith(key, 'x-');
}

export function parseReference(reference) {
  const parts = reference.split('/');

  if (parts[0] !== '#') {
    throw new Error('Schema reference must start with document root (#)');
  }

  if (parts[1] !== 'definitions' || parts.length !== 3) {
    throw new Error('Schema reference must be reference to #/definitions');
  }

  const id = parts[2];

  return id;
}

function lookupReference(reference, root) {
  const parts = reference.split('/').reverse();

  if (parts.pop() !== '#') {
    throw new Error('Schema reference must start with document root (#)');
  }

  if (parts.pop() !== 'definitions') {
    throw new Error('Schema reference must be reference to #/definitions');
  }

  const id = parts[0];
  let value = root.definitions;

  while (parts.length > 0 && value !== undefined) {
    const key = parts.pop();
    value = value[key];
  }

  if (value === undefined) {
    throw new Error(`Reference to ${reference} does not exist`);
  }

  return {
    id,
    referenced: value,
  };
}

function convertExample(example, swagger) {
  if (_.isArray(example)) {
    return example.map(value => convertExample(value, swagger));
  } else if (_.isObject(example)) {
    if (example.$ref) {
      const ref = lookupReference(example.$ref, swagger);
      return convertExample(ref.referenced, swagger);
    }

    const result = {};

    _.forEach(example, (value, key) => {
      result[key] = convertExample(value, swagger);
    });

    return result;
  }

  return example;
}

function convertSubSchema(schema, references, swagger) {
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
    actualSchema.examples = [convertExample(schema.example, swagger)];
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

/** Traverses the entire schema to find all of the references
 * @returns array of each reference that is found in the schema
 */
function findReferences(schema) {
  if (schema.$ref) {
    return [schema.$ref];
  }

  let references = [];

  if (schema.allOf) {
    references = references.concat(...schema.allOf.map(findReferences));
  }

  if (schema.anyOf) {
    references = references.concat(...schema.anyOf.map(findReferences));
  }

  if (schema.oneOf) {
    references = references.concat(...schema.oneOf.map(findReferences));
  }

  if (schema.not) {
    references = references.concat(...findReferences(schema.not));
  }

  // Array

  if (schema.items) {
    if (Array.isArray(schema.items)) {
      references = references.concat(...schema.items.map(findReferences));
    } else {
      references = references.concat(findReferences(schema.items));
    }
  }

  if (schema.additionalItems && typeof schema.additionalItems === 'object') {
    references = references.concat(findReferences(schema.additionalItems));
  }

  // Object

  if (schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      references = references.concat(findReferences(schema.properties[key]));
    });
  }

  if (schema.patternProperties) {
    Object.keys(schema.patternProperties).forEach((key) => {
      references = references.concat(findReferences(schema.patternProperties[key]));
    });
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    references = references.concat(findReferences(schema.additionalProperties));
  }

  return references;
}

/** Convert Swagger schema to JSON Schema
 * @param schema - The Swagger schema to convert
 * @param root - The document root (this contains the JSON schema definitions)
 * @param swagger - The swagger document root (this contains the Swagger schema definitions)
 * @param copyDefinitins - Whether to copy the referenced definitions to the resulted schema
 */
export function convertSchema(schema, root, swagger, copyDefinitions = true) {
  let references = [];
  const result = convertSubSchema(schema, references, swagger);

  if (copyDefinitions) {
    if (references.length !== 0) {
      result.definitions = {};
    }

    while (references.length !== 0) {
      const lookup = lookupReference(references.pop(), root);

      if (result.definitions[lookup.id] === undefined) {
        references = references.concat(findReferences(lookup.referenced));
        result.definitions[lookup.id] = lookup.referenced;
      }
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

export function convertSchemaDefinitions(definitions) {
  const jsonSchemaDefinitions = {};

  if (definitions) {
    _.forEach(definitions, (schema, key) => {
      jsonSchemaDefinitions[key] = convertSchema(schema, { definitions }, { definitions }, false);
    });
  }

  return jsonSchemaDefinitions;
}
