const R = require('ramda');
const {
  isExtension, hasKey, hasValue, getValue,
} = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');

const name = 'Schema Object';
const unsupportedKeys = [
  '$ref', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum',
  'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems',
  'minItems', 'uniqueItems', 'maxProperties', 'minProperties', 'enum',
  'properties', 'items', 'required', 'nullable', 'title', 'description',
  'default', 'oneOf', 'allOf', 'anyOf', 'not', 'additionalProperties',
  'format', 'discriminator', 'readOnly', 'writeOnly', 'xml', 'externalDocs',
  'deprecated', 'example',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

// purposely in the order defined in the JSON Schema spec, integer is an OAS 3 specific addition and thus is at the end
const types = ['boolean', 'object', 'array', 'number', 'string', 'integer'];
const isValidType = R.anyPass(R.map(hasValue, types));

/**
 * Parse Parameter Object's Schema Object
 *
 * @note Parameter Object's schema should be parsed using the standard schema
 * object parser (which also will handle references). At the moment many
 * other tooling does not expect references or complex elements in the
 * API Elements result and thus a simple schema object parser is used
 * directly so we can support simple cases.
 */
function parseSchemaObject(context) {
  const { namespace } = context;

  const ensureValidType = R.unless(
    isValidType,
    R.compose(
      createWarning(namespace, `'${name}' 'type' must be either ${types.join(', ')}`),
      getValue
    )
  );

  const parseType = pipeParseResult(namespace,
    parseString(context, name, false),
    ensureValidType);

  const parseMember = R.cond([
    [hasKey('type'), parseType],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],
    [isExtension, () => new namespace.elements.ParseResult()],
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return pipeParseResult(namespace,
    parseObject(context, name, parseMember, []),
    (schema) => {
      const type = schema.getValue('type');
      let element;

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
      } else {
        element = new namespace.elements.ParseResult([]);
      }

      return element;
    });
}

module.exports = parseSchemaObject;
