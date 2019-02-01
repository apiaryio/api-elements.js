const R = require('ramda');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const {
  isArray, isNull, isString, hasKey, getValue,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseBoolean = require('../parseBoolean');
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
const types = ['boolean', 'object', 'array', 'number', 'string', 'integer'];
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

function constructObjectStructure(namespace, schema) {
  const element = R.or(schema.get('properties'), new namespace.elements.Object());

  const required = schema.get('required');
  if (required) {
    required.forEach((key) => {
      const member = element.getMember(key.toValue());

      if (member) {
        member.attributes.set('typeAttributes', ['required']);
      }
    });
  }

  return element;
}

function constructArrayStructure(namespace, schema) {
  const element = new namespace.elements.Array();

  const items = schema.get('items');
  if (items) {
    element.attributes.set('typeAttributes', ['fixedType']);
    element.push(items);
  }

  return element;
}

function parseSchema(context) {
  const { namespace } = context;

  const ensureValidType = R.unless(isValidType, createWarning(namespace,
    `'Schema Object' 'type' must be either ${types.join(', ')}`));

  const parseType = pipeParseResult(namespace,
    parseString(context, name, false),
    ensureValidType);

  const parseSubSchema = element => parseReference('schemas', R.uncurryN(2, parseSchema), context, element, true);
  const parseProperties = parseObject(context, `${name}' 'properties`, R.compose(parseSubSchema, getValue));

  const arrayElementToParseResult = array => new namespace.elements.ParseResult(array.content);
  const parseArray = itemParser => pipeParseResult(namespace,
    R.unless(isArray, createWarning(namespace, `'${name}' 'required' is not an array`)),
    R.compose(
      R.map(itemParser),
      arrayElementToParseResult
    ),
    (...required) => new namespace.elements.Array([...required]));

  const parseRequiredString = R.unless(isString,
    createWarning(namespace, `'${name}' 'required' array value is not a string`));
  const parseRequired = parseArray(parseRequiredString);

  const parseMember = R.cond([
    [hasKey('type'), parseType],
    [hasKey('enum'), R.compose(parseEnum(context), getValue)],
    [hasKey('properties'), R.compose(parseProperties, getValue)],
    [hasKey('items'), R.compose(parseSubSchema, getValue)],
    [hasKey('required'), R.compose(parseRequired, getValue)],
    [hasKey('nullable'), parseBoolean(context, name, false)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (schema) => {
      let element;

      const enumerations = schema.get('enum');
      const type = schema.getValue('type');

      if (enumerations) {
        element = enumerations;
      } else if (type === 'object') {
        element = constructObjectStructure(namespace, schema);
      } else if (type === 'array') {
        element = constructArrayStructure(namespace, schema);
      } else if (type === 'string') {
        element = new namespace.elements.String();
      } else if (type === 'number' || type === 'integer') {
        element = new namespace.elements.Number();
      } else if (type === 'boolean') {
        element = new namespace.elements.Boolean();
      } else {
        element = new namespace.elements.Enum();
        element.enumerations = [
          new namespace.elements.String(),
          new namespace.elements.Number(),
          new namespace.elements.Boolean(),
          constructObjectStructure(namespace, schema),
          constructArrayStructure(namespace, schema),
        ];
      }

      const nullable = schema.getValue('nullable');
      if (nullable) {
        const typeAttributes = element.attributes.get('typeAttributes') || new namespace.elements.Array();
        typeAttributes.push('nullable');
        element.attributes.set('typeAttributes', typeAttributes);
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
