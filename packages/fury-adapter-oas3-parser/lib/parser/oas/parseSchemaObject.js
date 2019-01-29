const R = require('ramda');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const {
  isArray, isNull, hasKey, getValue,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseReference = require('../parseReference');

const name = 'Schema Object';
const unsupportedKeys = [
  // JSON Schema
  'title', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum',
  'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems',
  'minItems', 'uniqueItems', 'maxProperties', 'minProperties', 'required',

  // JSON Schema + OAS 3 specific rules
  'allOf', 'oneOf', 'anyOf', 'not', 'additionalProperties', 'description',
  'format', 'default',

  // OAS 3 specific
  'nullable', 'discriminator', 'readOnly', 'writeOnly', 'xml', 'externalDocs',
  'example', 'deprecated',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

// purposely in the order defined in the JSON Schema spec, integer is an OAS 3 specific addition and thus is at the end
const types = ['null', 'boolean', 'object', 'array', 'number', 'string', 'integer'];
const hasValue = R.curry((value, member) => member.value.toValue() === value);
const isValidType = R.anyPass(R.map(hasValue, types));

const parseEnum = context => pipeParseResult(context.namespace,
  R.unless(isArray, createWarning(context.namespace, `'${name}' 'enum' is not an array`)),
  (element) => {
    const enumElement = new context.namespace.elements.Enum();
    enumElement.enumerations = element;
    enumElement.enumerations.forEach(
      R.unless(isNull, value => value.attributes.set('typeAttributes', ['fixed']))
    );
    return enumElement;
  });

function parseSchema(context) {
  const { namespace } = context;

  const ensureValidType = R.unless(isValidType, createWarning(namespace,
    `'Schema Object' 'type' must be either ${types.join(', ')}`));

  const parseType = pipeParseResult(namespace,
    parseString(context, name, false),
    ensureValidType);

  const parseSubSchema = element => parseReference('schemas', R.uncurryN(2, parseSchema), context, element, true);
  const parseProperties = parseObject(context, `${name}' 'properties`, R.compose(parseSubSchema, getValue));

  const parseMember = R.cond([
    [hasKey('type'), parseType],
    [hasKey('enum'), R.compose(parseEnum(context), getValue)],
    [hasKey('properties'), R.compose(parseProperties, getValue)],
    [hasKey('items'), R.compose(parseSubSchema, getValue)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (schema) => {
      // FIXME: Return a dataStructure to represent the given schema
      let element;

      const enumerations = schema.get('enum');
      const type = schema.getValue('type');

      if (enumerations) {
        element = enumerations;
      } else if (type === 'object') {
        element = schema.get('properties');

        if (!element) {
          element = new namespace.elements.Object();
        }
      } else if (type === 'array') {
        element = new namespace.elements.Array();

        const items = schema.get('items');
        if (items) {
          element.attributes.set('typeAttributes', ['fixedType']);
          element.push(items);
        }
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

      return element;
    });
}

/**
 * Parse Schema Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schemaObject
 */
function parseSchemaObject(context, element) {
  const DataStructure = R.constructN(1, context.namespace.elements.DataStructure);

  return pipeParseResult(context.namespace,
    parseSchema(context),
    DataStructure)(element);
}

module.exports = R.curry(parseSchemaObject);
