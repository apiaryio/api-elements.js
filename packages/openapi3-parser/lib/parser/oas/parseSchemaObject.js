const R = require('ramda');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const {
  isString, hasKey, hasValue, getValue,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseArray = require('../parseArray');
const parseString = require('../parseString');
const parseBoolean = require('../parseBoolean');
const parseEnum = require('../parseEnum');
const parseReference = require('../parseReference');

const name = 'Schema Object';
const unsupportedKeys = [
  // JSON Schema
  'title', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum',
  'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems',
  'minItems', 'uniqueItems', 'maxProperties', 'minProperties', 'required',

  // JSON Schema + OAS 3 specific rules
  'allOf', 'oneOf', 'anyOf', 'not', 'additionalProperties', 'format',

  // OAS 3 specific
  'discriminator', 'readOnly', 'writeOnly', 'xml', 'externalDocs', 'deprecated',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

// purposely in the order defined in the JSON Schema spec, integer is an OAS 3 specific addition and thus is at the end
const types = ['boolean', 'object', 'array', 'number', 'string', 'integer'];
const isValidType = R.anyPass(R.map(hasValue, types));

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

// Returns whether the given element value matches an enumeration of fixed values
const valueMatchesEnumerationValues = (enumeration, value) => {
  const permittedValues = enumeration.attributes.getValue('enumerations');
  return permittedValues.includes(value.toValue());
};

function validateValuesMatchSchema(context, schema) {
  const { namespace } = context;

  const validate = (member) => {
    const nullable = schema.getValue('nullable');
    if (nullable && member.value.element === 'null') {
      return member;
    }

    const enumeration = schema.get('enum');
    if (enumeration && !valueMatchesEnumerationValues(enumeration, member.value)) {
      return createWarning(namespace,
        `'${name}' '${member.key.toValue()}' is not included in 'enum'`, member.value);
    }

    const type = schema.getValue('type');
    if (type && !valueMatchesType(type, member.value)) {
      return createWarning(namespace,
        `'${name}' '${member.key.toValue()}' does not match expected type '${type}'`, member.value);
    }

    return member;
  };

  const isDefaultOrExample = R.anyPass([hasKey('example'), hasKey('default')]);
  const parseMember = R.cond([
    [isDefaultOrExample, validate],
    [R.T, e => e],
  ]);

  return parseObject(context, name, parseMember)(schema);
}

function parseSchema(context) {
  const { namespace } = context;

  const ensureValidType = R.unless(
    isValidType,
    R.compose(
      createWarning(namespace, `'Schema Object' 'type' must be either ${types.join(', ')}`),
      getValue
    )
  );

  const parseType = pipeParseResult(namespace,
    parseString(context, name, false),
    ensureValidType);

  const parseSubSchema = element => parseReference('schemas', R.uncurryN(2, parseSchema), context, element, true);
  const parseProperties = parseObject(context, `${name}' 'properties`, R.compose(parseSubSchema, getValue));

  const parseRequiredString = R.unless(isString,
    createWarning(namespace, `'${name}' 'required' array value is not a string`));
  const parseRequired = parseArray(context, `${name}' 'required`, parseRequiredString);

  const parseMember = R.cond([
    [hasKey('type'), parseType],
    [hasKey('enum'), R.compose(parseEnum(context, name), getValue)],
    [hasKey('properties'), R.compose(parseProperties, getValue)],
    [hasKey('items'), R.compose(parseSubSchema, getValue)],
    [hasKey('required'), R.compose(parseRequired, getValue)],
    [hasKey('nullable'), parseBoolean(context, name, false)],
    [hasKey('description'), parseString(context, name, false)],
    [hasKey('default'), e => e.clone()],
    [hasKey('example'), e => e.clone()],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    R.curry(validateValuesMatchSchema)(context),
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

      const description = schema.getValue('description');
      if (description) {
        element.description = description;
      }

      const nullable = schema.getValue('nullable');
      if (nullable) {
        const typeAttributes = element.attributes.get('typeAttributes') || new namespace.elements.Array();
        typeAttributes.push('nullable');
        element.attributes.set('typeAttributes', typeAttributes);
      }

      const defaultValue = schema.get('default');
      if (defaultValue) {
        element.attributes.set('default', defaultValue);
      }

      const example = schema.get('example');
      if (example) {
        element.attributes.set('samples', [example]);
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
 * @private
 */
function parseSchemaObject(context, element) {
  const DataStructure = R.constructN(1, context.namespace.elements.DataStructure);

  return pipeParseResult(context.namespace,
    parseSchema(context),
    DataStructure)(element);
}

module.exports = R.curry(parseSchemaObject);
