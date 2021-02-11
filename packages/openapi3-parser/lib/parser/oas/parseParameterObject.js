const R = require('ramda');
const {
  isExtension, hasKey, hasValue, getValue,
} = require('../../predicates');
const {
  createError,
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseBoolean = require('../parseBoolean');
const parseSchemaObject = require('./parseParameterObjectSchemaObject');

const name = 'Parameter Object';
const requiredKeys = ['name', 'in'];
const unsupportedKeys = [
  'deprecated', 'allowEmptyValue', 'style', 'allowReserved',
  'examples', 'content',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const isValidInValue = R.anyPass([
  hasValue('query'), hasValue('header'), hasValue('path'), hasValue('cookie'),
]);
const isSupportedIn = R.anyPass([
  hasValue('path'), hasValue('query'), hasValue('header'),
]);

const unreservedCharacterRegex = /^[A-z0-9\\.\\_\\~\\-]+$/;
const reservedHeaderNamesRegex = /Accept|Content-Type|Authorization/i;
const pathNameAllowedRegex = /^[A-z0-9._]+$/;

const encodeQueryName = name => encodeURIComponent(name)
  .replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`) //  as sugested by https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#Description
  .replace(/%25([0-9a-f]{2})/gi, (match, hex) => `%${hex}`); // revert double encoded sequences

function nameContainsReservedCharacter(parameter) {
  return !unreservedCharacterRegex.test(parameter.get('name').toValue());
}

function validateRequiredForPathParameter(context, object, parameter) {
  const parseResult = new context.namespace.elements.ParseResult([
    parameter,
  ]);

  const required = parameter.get('required');

  if (!required && !object.get('required')) {
    parseResult.push(createWarning(context.namespace,
      "'Parameter Object' 'required' must exist when 'in' is set to 'path'", parameter));
  } else if (required && required.toValue() !== true) {
    parseResult.push(createWarning(context.namespace,
      "'Parameter Object' 'required' must be 'true' when 'in' is set to 'path'", required));
  }

  parameter.set('required', true);

  return parseResult;
}

const hasExplodeWithoutQueryIn = R.both(
  object => object.getValue('explode') === true,
  object => object.getValue('in') !== 'query'
);

/**
 * Parse Parameter Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
 * @private
 */
function parseParameterObject(context, object) {
  const { namespace } = context;

  const createInvalidInWarning = R.compose(
    createWarning(namespace, `'${name}' 'in' must be either 'query', 'header', 'path' or 'cookie'`),
    getValue
  );
  const validateIn = R.unless(isValidInValue, createInvalidInWarning);

  const createUnsupportedInWarning = member => createWarning(namespace,
    `'${name}' 'in' '${member.value.toValue()}' is unsupported`, member.value);
  const ensureSupportedIn = R.unless(isSupportedIn, createUnsupportedInWarning);

  const parseIn = pipeParseResult(namespace,
    parseString(context, name, true),
    validateIn,
    ensureSupportedIn);

  const parseName = pipeParseResult(namespace, parseString(context, name, true));

  const parseMember = R.cond([
    [hasKey('name'), parseName],
    [hasKey('in'), parseIn],
    [hasKey('description'), parseString(context, name, false)],
    [hasKey('required'), parseBoolean(context, name, false)],
    [hasKey('explode'), parseBoolean(context, name, false)],
    [hasKey('example'), e => e.clone()],
    [hasKey('schema'), R.pipe(getValue, parseSchemaObject(context))],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const createUnsupportedNameError = createError(namespace, `'${name}' 'name' contains unsupported characters. Only alphanumeric characters are currently supported`);

  const createReservedHeaderNamesWarning = createWarning(namespace, `'${name}' 'name' in location 'header' should not be 'Accept', 'Content-Type' or 'Authorization'`);

  const createMalformedUriCharacterError = createError(namespace, `'${name}' 'name' in location 'query' contains URI malformed characters`);

  const hasLocation = R.curry((location, parameter) => parameter.getValue('in') === location);

  const validatePathName = R.when(
    R.pipe(R.invoker(1, 'get')('name'),
      R.invoker(0, 'toValue'),
      R.test(pathNameAllowedRegex),
      R.not),
    createUnsupportedNameError
  );

  const nameContainsReservedHeaderName = parameter => parameter.get('name')
    .toValue()
    .match(reservedHeaderNamesRegex);

  const sanitizeQueryName = R.tryCatch((parameter) => {
    const name = parameter.get('name');
    name.content = encodeQueryName(name.toValue());
    return parameter;
  },
  (err, parameter) => createMalformedUriCharacterError(parameter.get('name')));

  const validateHeaderName = pipeParseResult(namespace,
    R.when(nameContainsReservedCharacter, createUnsupportedNameError),
    R.when(nameContainsReservedHeaderName, createReservedHeaderNamesWarning));

  const createUnsupportedExplodeWarning = (object) => {
    const member = object.getMember('explode');
    const inValue = object.getValue('in');
    const message = `'${name}' '${member.key.toValue()}' is unsupported in ${inValue}`;
    return createWarning(namespace, message, member.key);
  };

  const attachWarning = R.curry((createWarning, value) => {
    const warning = createWarning(value);
    return new namespace.elements.ParseResult([value, warning]);
  });

  const parseParameter = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys),
    R.when(hasLocation('path'), R.curry(validateRequiredForPathParameter)(context, object)),
    R.when(hasLocation('path'), validatePathName),
    R.when(hasLocation('query'), sanitizeQueryName),
    R.when(hasLocation('header'), validateHeaderName),
    R.when(hasExplodeWithoutQueryIn, attachWarning(createUnsupportedExplodeWarning)),
    (parameter) => {
      const example = parameter.get('example');
      const member = new namespace.elements.Member(parameter.get('name'), example);

      if (example === undefined) {
        const schema = parameter.get('schema');

        if (schema) {
          member.value = schema;
        }
      }

      const description = parameter.get('description');
      if (description) {
        member.description = description;
      }

      const required = parameter.get('required');
      if (required && required.toValue() === true) {
        const typeAttributes = new namespace.elements.Array([new namespace.elements.String('required')]);
        member.attributes.set('typeAttributes', typeAttributes);
      }

      member.in = parameter.getValue('in');
      member.explode = parameter.getValue('explode');

      return member;
    });

  return parseParameter(object);
}

module.exports = R.curry(parseParameterObject);
