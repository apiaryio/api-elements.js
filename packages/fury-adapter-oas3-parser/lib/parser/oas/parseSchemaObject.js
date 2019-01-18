const R = require('ramda');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const { isObject, hasKey } = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');

const name = 'Schema Object';
const unsupportedKeys = [
  // JSON Schema
  'title', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum',
  'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems',
  'minItems', 'uniqueItems', 'maxProperties', 'minProperties', 'required',
  'enum',

  // JSON Schema + OAS 3 specific rules
  'allOf', 'oneOf', 'anyOf', 'not', 'items', 'properties',
  'additionalProperties', 'description', 'format', 'default',

  // OAS 3 specific
  'nullable', 'discriminator', 'readOnly', 'writeOnly', 'xml', 'externalDocs',
  'example', 'deprecated',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

// purposely in the order defined in the JSON Schema spec, integer is an OAS 3 specific addition and thus is at the end
const types = ['null', 'boolean', 'object', 'array', 'number', 'string', 'integer'];
const hasValue = R.curry((value, member) => member.value.toValue() === value);
const isValidType = R.anyPass(R.map(hasValue, types));

/**
 * Parse Schema Object
 *
 * @param namespace {Namespace}
 * @param element {MemberElement}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schemaObject
 */
function parseSchemaObject(context, member) {
  const { namespace } = context;

  const ensureValidType = R.unless(isValidType, createWarning(namespace,
    `'Schema Object' 'type' must be either ${types.join(', ')}`));

  const parseType = pipeParseResult(namespace,
    parseString(context, name, false),
    ensureValidType);

  const parseMember = R.cond([
    [hasKey('type'), parseType],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseSchema = pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    parseObject(context, parseMember),
    (schema) => {
      // FIXME: Return a dataStructure to represent the given schema
      let element;

      const type = schema.getValue('type');
      if (type === 'object') {
        element = new namespace.elements.Object();
      } else if (type === 'array') {
        element = new namespace.elements.Array();
      } else if (type === 'string') {
        element = new namespace.elements.String();
      } else if (type === 'number' || type === 'integer') {
        element = new namespace.elements.Number();
      } else if (type === 'boolean') {
        element = new namespace.elements.Boolean();
      } else if (type === 'null') {
        element = new namespace.elements.Null();
      } else {
        return new namespace.elements.ParseResult();
      }

      element.id = member.key.clone();

      return new namespace.elements.DataStructure(element);
    });

  return parseSchema(member.value);
}

module.exports = R.curry(parseSchemaObject);
