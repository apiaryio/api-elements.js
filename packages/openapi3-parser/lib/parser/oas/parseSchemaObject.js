const R = require('ramda');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const {
  isString, hasKey, getValue,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseArray = require('../parseArray');
const parseString = require('../parseString');
const parseBoolean = require('../parseBoolean');
const parseEnum = require('../parseEnum');
const parseReference = require('../parseReference');

const name = 'Schema Object';
const unsupportedKeys = [
  // JSON Schema Core applicators
  'allOf', 'anyOf', 'not',

  // JSON Schema Validation (6.2 Numeric)
  'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum',

  // JSON Schema Validation (6.3 Strings)
  'maxLength', 'minLength', 'pattern', 'format',

  // JSON Schema Validation (6.4 Array)
  'maxItems', 'minItems', 'uniqueItems',

  // JSON Schema Validation (6.5 Objects)
  'maxProperties', 'minProperties',

  // OAS 3 specific
  'discriminator', 'readOnly', 'writeOnly', 'xml', 'externalDocs', 'deprecated',
];
const unsupportedJSONSchemaDraft202012 = [
  // General applicators
  'if', 'then', 'else', 'dependentSchemas',

  // Array
  'prefixItems', 'unevaluatedItems', 'contains', 'minContains', 'maxContains',

  // Object
  'propertiesNames', 'unevaluatedProperties', 'dependentRequired',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));
const isUnsupportedKeyJSONSchemaDraft202012 = R.anyPass(
  R.map(hasKey, unsupportedJSONSchemaDraft202012)
);


function constructObjectStructure(namespace, schema) {
  const element = R.or(schema.get('properties'), new namespace.elements.Object());

  const required = schema.get('required');
  if (required) {
    const attachMember = element.push.bind(element);
    const findMember = element.getMember.bind(element);

    const createMember = R.constructN(1, namespace.elements.Member);
    const findOrCreateMember = R.either(
      findMember,
      R.pipe(createMember, R.tap(attachMember))
    );

    required
      .toValue()
      .map(findOrCreateMember)
      .forEach(member => member.attributes.set('typeAttributes', ['required']));
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

function constructStructure(namespace, schema, type) {
  let element;

  if (type === 'object') {
    element = constructObjectStructure(namespace, schema);
  } else if (type === 'array') {
    element = constructArrayStructure(namespace, schema);
  } else if (type === 'string') {
    element = new namespace.elements.String();
  } else if (type === 'number' || type === 'integer') {
    element = new namespace.elements.Number();
  } else if (type === 'boolean') {
    element = new namespace.elements.Boolean();
  } else if (type === 'null') {
    element = new namespace.elements.Null();
  } else {
    throw new Error(`Internal Inconsistency: constructStructure called with unexpected type: '${type}'`);
  }

  return element;
}

const openapi30Types = ['boolean', 'object', 'array', 'number', 'string', 'integer'];
const openapi31Types = openapi30Types.concat(['null']);
const isValidOpenAPI30Type = R.anyPass(R.map(R.equals, openapi30Types));
const isValidOpenAPI31Type = R.anyPass(R.map(R.equals, openapi31Types));

const typeToElementNameMap = {
  array: 'array',
  boolean: 'boolean',
  integer: 'number',
  null: 'null',
  number: 'number',
  object: 'object',
  string: 'string',
};

/*
 * Parse StringElement containing OpenAPI Schema type
 * Normalises result into an ArrayElement of StringElement
 */
function parseType(context) {
  let types;
  let isValidType;

  if (context.isOpenAPIVersionMoreThanOrEqual(3, 1)) {
    types = openapi31Types;
    isValidType = isValidOpenAPI31Type;
  } else {
    types = openapi30Types;
    isValidType = isValidOpenAPI30Type;
  }

  const ensureValidType = R.unless(
    element => isValidType(element.toValue()),
    createWarning(context.namespace, `'${name}' 'type' must be either ${types.join(', ')}`)
  );

  return pipeParseResult(context.namespace,
    R.unless(isString, value => createWarning(context.namespace, `'${name}' 'type' is not a string`, value)),
    ensureValidType,
    type => new context.namespace.elements.Array([type]));
}

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

  const isDefaultOrExample = R.either(hasKey('example'), hasKey('default'));
  const parseMember = R.cond([
    [isDefaultOrExample, validate],
    [R.T, e => e],
  ]);

  return parseObject(context, name, parseMember)(schema);
}

// Warns if oneOf is used with other unsupported constraints
function validateOneOfIsNotUsedWithUnsupportedConstraints(context) {
  // oneOf can be used like the following:
  //
  //   oneOf:
  //     - ...
  //     - ...
  //   ...
  //
  // where its effectively a combination of "one of these two constraints"
  // and "also these other constraits" which is effectively:
  //
  //   allOf:
  //     - oneOf:
  //         - ...
  //         - ...
  //      - ...
  //
  // API Element's doesn't have a way to support `allOf` and thus using
  // `oneOf` alongside other constraints is unsupported.
  //
  // We can allow annotations and (nullable as that is simple to support).

  // is a JSON Schema annotation (not constraint)
  const isAnnotation = R.anyPass([
    hasKey('title'),
    hasKey('description'),
    hasKey('default'),
    hasKey('example'),
  ]);

  const createUnsupportedWithOneOfWarning = member => createWarning(context.namespace,
    `'${name}' has limited support for 'oneOf', use of '${member.key.toValue()}' with 'oneOf' is not supported`,
    member.key);

  const parseMember = R.cond([
    [hasKey('oneOf'), R.identity],
    [hasKey('nullable'), R.identity],
    [isAnnotation, R.identity],
    [R.T, createUnsupportedWithOneOfWarning],
  ]);

  return parseObject(context, name, parseMember);
}

function parseSchema(context) {
  const { namespace } = context;

  const parseSubSchema = element => parseReference('schemas', R.uncurryN(2, parseSchema), context, element, true);
  const parseProperties = parseObject(context, `${name}' 'properties`, R.compose(parseSubSchema, getValue));

  const parseRequiredString = R.unless(isString,
    createWarning(namespace, `'${name}' 'required' array value is not a string`));
  const parseRequired = parseArray(context, `${name}' 'required`, parseRequiredString);

  const parseOneOf = pipeParseResult(namespace,
    parseArray(context, `${name}' 'oneOf`, parseSubSchema),
    (oneOf) => {
      const element = new namespace.elements.Enum();
      element.enumerations = oneOf;
      return element;
    });

  const parseMember = R.cond([
    [hasKey('type'), R.compose(parseType(context), getValue)],
    [hasKey('enum'), R.compose(parseEnum(context, name), getValue)],
    [hasKey('properties'), R.compose(parseProperties, getValue)],
    [hasKey('items'), R.compose(parseSubSchema, getValue)],
    [hasKey('required'), R.compose(parseRequired, getValue)],
    [hasKey('nullable'), parseBoolean(context, name, false)],
    [hasKey('title'), parseString(context, name, false)],
    [hasKey('description'), parseString(context, name, false)],
    [hasKey('default'), e => e.clone()],
    [hasKey('example'), e => e.clone()],
    [hasKey('oneOf'), R.compose(parseOneOf, getValue)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],
    [
      R.both(
        isUnsupportedKeyJSONSchemaDraft202012,
        R.always(context.isOpenAPIVersionMoreThanOrEqual(3, 1))
      ),
      createUnsupportedMemberWarning(namespace, name),
    ],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    R.curry(validateValuesMatchSchema)(context),
    R.when(object => object.hasKey('oneOf'), validateOneOfIsNotUsedWithUnsupportedConstraints(context)),
    (schema) => {
      let element;

      const oneOf = schema.get('oneOf');
      const enumerations = schema.get('enum');
      const type = schema.getValue('type') || [];

      if (oneOf) {
        element = oneOf;
      } else if (enumerations) {
        element = enumerations;
      } else if (type.length > 1) {
        throw new Error('Implementation error: unexpected multiple types');
      } else if (type.length === 1) {
        element = constructStructure(namespace, schema, type[0]);
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

      const title = schema.getValue('title');
      if (title) {
        element.title = title;
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
