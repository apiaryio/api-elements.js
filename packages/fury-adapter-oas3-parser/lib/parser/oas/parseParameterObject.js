const R = require('ramda');
const { isExtension, hasKey, getValue } = require('../../predicates');
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

const name = 'Parameter Object';
const requiredKeys = ['name', 'in'];
const unsupportedKeys = [
  'deprecated', 'allowEmptyValue', 'style', 'explode', 'allowReserved',
  'schema', 'example', 'examples', 'content',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const hasValue = R.curry((value, member) => member.value.toValue() === value);
const isValidInValue = R.anyPass([
  hasValue('query'),
  hasValue('header'),
  hasValue('path'),
  hasValue('cookie'),
]);

const unreservedCharacterRegex = /^[A-z0-9\\.\\_\\~\\-]+$/;
function nameContainsReservedCharacter(member) {
  return !unreservedCharacterRegex.test(member.value.toValue());
}

/**
 * Parse Parameter Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
 */
function parseParameterObject(context, object) {
  const { namespace } = context;

  const createInvalidInError = R.compose(
    createError(namespace, `'${name}' 'in' must be either 'query, 'header', 'path' or 'cookie'`),
    getValue
  );
  const validateIn = R.unless(isValidInValue, createInvalidInError);

  const isSupportedIn = R.anyPass([hasValue('path'), hasValue('query')]);
  const createUnsupportedInWarning = member => createWarning(namespace,
    `'${name}' 'in' ${member.value.toValue()} is unsupported`, member.value);
  const ensureSupportedIn = R.unless(isSupportedIn, createUnsupportedInWarning);

  const parseIn = pipeParseResult(namespace,
    parseString(context, name, true),
    validateIn,
    ensureSupportedIn);

  const createUnsupportedNameError = R.compose(
    createError(namespace, `'${name}' 'name' contains unsupported characters. Only alphanumeric characters are currently supported`),
    getValue
  );
  const validateName = R.when(nameContainsReservedCharacter, createUnsupportedNameError);
  const parseName = pipeParseResult(namespace,
    parseString(context, name, true),
    validateName);

  const parseMember = R.cond([
    [hasKey('name'), parseName],
    [hasKey('in'), parseIn],
    [hasKey('description'), parseString(context, name, false)],
    [hasKey('required'), parseBoolean(context, name, false)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseParameter = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys),
    (parameter) => {
      const member = new namespace.elements.Member(parameter.get('name'));

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

      return member;
    });

  return parseParameter(object);
}

module.exports = R.curry(parseParameterObject);
