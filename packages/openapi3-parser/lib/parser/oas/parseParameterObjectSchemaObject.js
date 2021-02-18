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
const parseEnum = require('../parseEnum');

const name = 'Schema Object';
const unsupportedKeys = [
  '$ref', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum',
  'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems',
  'minItems', 'uniqueItems', 'maxProperties', 'minProperties',
  'properties', 'items', 'required', 'nullable',
  'default', 'oneOf', 'allOf', 'anyOf', 'not', 'additionalProperties',
  'format', 'discriminator', 'readOnly', 'writeOnly', 'xml', 'externalDocs',
  'deprecated',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const types = ['boolean', 'object', 'array', 'number', 'string', 'integer'];
const isValidType = R.anyPass(R.map(hasValue, types));

const typeToElementNameMap = {
  array: 'array',
  boolean: 'boolean',
  integer: 'number',
  null: 'null',
  number: 'number',
  object: 'object',
  string: 'string',
};

// Returns whether the given element value matches the provided schema type
const valueMatchesType = (type, value) => {
  const expectedElementType = typeToElementNameMap[type];
  return value.element === expectedElementType;
};

function validateValuesMatchSchema(context, schema) {
  const validate = (member) => {
    const type = schema.getValue('type');
    if (type && !valueMatchesType(type, member.value)) {
      return createWarning(context.namespace,
        `'${name}' '${member.key.toValue()}' does not match expected type '${type}'`, member.value);
    }

    return member;
  };

  const parseMember = R.cond([
    [hasKey('example'), validate],
    [R.T, e => e],
  ]);

  return parseObject(context, name, parseMember)(schema);
}

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
    [hasKey('example'), e => e.clone()],
    [hasKey('enum'), R.compose(parseEnum(context, name), getValue)],

    [hasKey('title'), parseString(context, name, false)],
    [hasKey('description'), parseString(context, name, false)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],
    [isExtension, () => new namespace.elements.ParseResult()],
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return pipeParseResult(namespace,
    parseObject(context, name, parseMember, []),
    R.curry(validateValuesMatchSchema)(context),
    (schema) => {
      const type = schema.getValue('type');
      let element;

      const enumerations = schema.get('enum');

      if (enumerations) {
        element = enumerations;
      } else if (type === 'object') {
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
        return new namespace.elements.ParseResult([]);
      }

      const title = schema.getValue('title');
      if (title) {
        element.title = title;
      }

      const description = schema.getValue('description');
      if (description) {
        element.description = description;
      }

      const example = schema.get('example');
      if (example) {
        element.attributes.set('samples', [example]);
      }

      return element;
    });
}

module.exports = parseSchemaObject;
