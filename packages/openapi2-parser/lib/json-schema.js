const _ = require('lodash');

class ReferenceError extends Error {}

// Test whether a key is a special Swagger extension.
const isExtension = (value, key) => _.startsWith(key, 'x-');

const parseReference = (reference) => {
  const parts = reference.split('/');

  if (parts[0] !== '#') {
    throw new ReferenceError('Schema reference must start with document root (#)');
  }

  if (parts[1] !== 'definitions' || parts.length !== 3) {
    throw new ReferenceError('Schema reference must be reference to #/definitions');
  }

  const id = parts[2];

  return id;
};

/**
 * Lookup a reference
 *
 * Resolves a reference in the given root schema. An optional depth argument
 * can be provided to limit resolution to a certain level. For example to
 * limit the `#/definitions/User/properties/name` reference lookup to just a
 * depth `#/definitions/User`, a depth of 3 can be supplied.
 *
 * @param reference {string} - Example: #/definitions/User/properties/name
 * @param root {object} - The object to resolve the given reference
 * @param depth {number} - A limit to resolving the depth
 *
 * @private
 */
const lookupReference = (reference, root, depth) => {
  const parts = reference.split('/').reverse();

  if (parts.pop() !== '#') {
    throw new ReferenceError('Schema reference must start with document root (#)');
  }

  if (parts.pop() !== 'definitions') {
    throw new ReferenceError('Schema reference must be reference to #/definitions');
  }

  const id = parts[parts.length - 1];
  let value = root.definitions;

  // ['#', 'definitions'] (2)
  let currentDepth = 2;

  while (parts.length > 0 && value !== undefined) {
    const key = parts.pop();
    value = value[key];
    currentDepth += 1;

    if (depth && depth === currentDepth) {
      break;
    }
  }

  if (value === undefined) {
    throw new ReferenceError(`Reference to ${reference} does not exist`);
  }

  return {
    id,
    referenced: value,
  };
};

const pathHasCircularReference = (paths, path, reference) => {
  const currentPath = (path || []).join('/');

  // Check for direct circular reference
  if (currentPath.startsWith(reference)) {
    return true;
  }

  // Check for indirect circular Reference
  if ((paths || []).find(p => p.startsWith(reference))) {
    return true;
  }

  return false;
};

const dereference = (example, root, paths, path) => {
  // We shouldn't even be dereferencing examples, but given how swagger-parser
  // works it had been doing this from the start (which was caught later).
  //
  // See https://github.com/apiaryio/api-elements.js/issues/220
  //
  // At thsi point, changing that behaviour would be a significant breaking
  // change and it will affect some of our larger users. Not to mention that
  // swagger-parser will still dereference the examples in cases where our code
  // path doesn't, it won't be easy to solve.
  //
  // The below code attemps to dereference an example, but if we can't we
  // will just return the example (possibly a "reference object") to be
  // the example value.

  if (example === null || example === undefined) {
    return example;
  }

  if (example.$ref && _.isString(example.$ref)) {
    const refPath = example.$ref.split('/');
    const currentPath = (path || []).join('/');

    if (path && pathHasCircularReference(paths, path, example.$ref)) {
      return {};
    }

    let ref;

    try {
      ref = lookupReference(example.$ref, root);
    } catch (error) {
      if (error instanceof ReferenceError) {
        // Cannot find the reference, use example
        return example;
      }

      throw error;
    }

    const newPaths = (paths || []).concat([currentPath]);
    return dereference(ref.referenced, root, newPaths, refPath);
  }

  if (_.isArray(example)) {
    return example.map(value => dereference(value, root, paths, path));
  }

  if (_.isObject(example)) {
    const result = {};

    _.forOwn(example, (value, key) => {
      result[key] = dereference(value, root, paths, (path || []).concat([key]));
    });

    return result;
  }

  return example;
};

const convertSubSchema = (schema, references, swagger) => {
  if (schema.$ref) {
    references.push(schema.$ref);
    return { $ref: schema.$ref };
  }

  const recurseConvertSubSchema = s => convertSubSchema(s, references, swagger);

  let actualSchema = _.omit(schema, ['discriminator', 'readOnly', 'xml', 'externalDocs', 'example']);
  actualSchema = _.omitBy(actualSchema, isExtension);
  actualSchema = _.cloneDeep(actualSchema);

  if (schema.type === 'file') {
    // file is not a valid JSON Schema type let's pick string instead
    actualSchema.type = 'string';
  }

  if (schema.pattern && schema.minLength && schema.pattern.startsWith('^[') && schema.pattern.endsWith(']*$')) {
    // If a schema has a minimal length (minLength) > 0 AND there is a regex
    // such as: `^[A-z]*$`, the schema can resolve to an empty string which
    // doesn't match minLength.
    //
    // JSON Schema Faker will fail in that case and get into an infinite loop.
    actualSchema.pattern = schema.pattern.replace('*$', '+$');
  }

  if (schema.example) {
    actualSchema.examples = [dereference(schema.example, swagger)];
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
    actualSchema.allOf = schema.allOf.map(recurseConvertSubSchema);
  }

  if (schema.anyOf) {
    actualSchema.anyOf = schema.anyOf.map(recurseConvertSubSchema);
  }

  if (schema.oneOf) {
    actualSchema.oneOf = schema.oneOf.map(recurseConvertSubSchema);
  }

  if (schema.not) {
    actualSchema.not = recurseConvertSubSchema(schema.not);
  }

  // Array

  if (schema.items) {
    if (Array.isArray(schema.items)) {
      actualSchema.items = schema.items.map(recurseConvertSubSchema);
    } else {
      actualSchema.items = recurseConvertSubSchema(schema.items);
    }
  }

  if (schema.additionalItems && typeof schema.additionalItems === 'object') {
    actualSchema.additionalItems = recurseConvertSubSchema(schema.additionalItems);
  }

  // Object

  if (schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      actualSchema.properties[key] = recurseConvertSubSchema(schema.properties[key]);
    });
  }

  if (schema.patternProperties) {
    Object.keys(schema.patternProperties).forEach((key) => {
      actualSchema.patternProperties[key] = recurseConvertSubSchema(schema.patternProperties[key]);
    });
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    actualSchema.additionalProperties = recurseConvertSubSchema(schema.additionalProperties);
  }

  return actualSchema;
};

/**
 * Returns true if the given schema contains any references
 *
 * @private
 */
const checkSchemaHasReferences = (schema) => {
  if (!schema) {
    return false;
  }

  if (schema.$ref) {
    return true;
  }

  return Object.values(schema).some((value) => {
    if (_.isArray(value)) {
      return value.some(checkSchemaHasReferences);
    }

    if (_.isObject(value)) {
      return checkSchemaHasReferences(value);
    }

    return false;
  });
};

/**
 * Traverses the entire schema to find all of the references
 * @returns array of each reference that is found in the schema
 * @private
 */
const findReferences = (schema) => {
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
};

/**
 * Convert Swagger schema to JSON Schema
 * @param schema - The Swagger schema to convert
 * @param root - The document root (this contains the JSON schema definitions)
 * @param swagger - The swagger document root (this contains the Swagger schema definitions)
 * @param copyDefinitins - Whether to copy the referenced definitions to the resulted schema
 * @private
 */
const convertSchema = (schema, root, swagger, copyDefinitions = true) => {
  let references = [];
  const result = convertSubSchema(schema, references, swagger);

  if (copyDefinitions) {
    result.$schema = 'http://json-schema.org/draft-04/schema#';

    if (references.length !== 0) {
      result.definitions = {};
    }

    while (references.length !== 0) {
      const lookup = lookupReference(references.pop(), root, 3);

      if (result.definitions[lookup.id] === undefined) {
        references = references.concat(findReferences(lookup.referenced));
        result.definitions[lookup.id] = lookup.referenced;
      }
    }
  }

  if (result.$ref && copyDefinitions) {
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
};

const convertSchemaDefinitions = (definitions) => {
  const jsonSchemaDefinitions = {};

  if (definitions) {
    _.forOwn(definitions, (schema, key) => {
      jsonSchemaDefinitions[key] = convertSchema(schema, { definitions }, { definitions }, false);
    });
  }

  return jsonSchemaDefinitions;
};

module.exports = {
  isExtension, parseReference, lookupReference, dereference, convertSchema, convertSchemaDefinitions,
};
