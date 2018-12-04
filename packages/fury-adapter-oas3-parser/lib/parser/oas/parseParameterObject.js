const R = require('ramda');
const { isObject, isExtension, hasKey } = require('../../predicates');
const {
  createError,
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  validateObjectContainsRequiredKeys,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');

const name = 'Parameter Object';
const requiredKeys = ['name', 'in'];
const unsupportedKeys = [
  // FIXME Only contains "fixed" fields from spec
  'required', 'deprecated', 'allowEmptyValue',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const hasValue = R.curry((value, member) => member.value.toValue() === value);
const isValidInValue = R.anyPass([
  hasValue('query'),
  hasValue('header'),
  hasValue('path'),
  hasValue('cookie'),
]);

/**
 * Parse Parameter Object
 *
 * @param minim {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
 */
function parseParameterObject(minim, object) {
  const validateIn = R.unless(isValidInValue, createError(minim,
    "'Parameter Object' 'in' must be either 'query, 'header', 'path' or 'cookie'"));

  // FIXME: The following should not be an error
  const ensureInPath = R.unless(hasValue('path'), createError(minim,
    "Only 'in' values of 'path' are supported at the moment"));

  const parseIn = pipeParseResult(minim,
    parseString(minim, name, true),
    validateIn,
    ensureInPath);

  const parseMember = R.cond([
    [hasKey('name'), parseString(minim, name, true)],
    [hasKey('in'), parseIn],
    [hasKey('description'), parseString(minim, name, false)],

    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new minim.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseParameter = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    validateObjectContainsRequiredKeys(minim, name, requiredKeys),
    parseObject(minim, parseMember),
    (parameter) => {
      const member = new minim.elements.Member(parameter.get('name'));

      const description = parameter.get('description');
      if (description) {
        member.description = description;
      }

      return member;
    });

  return parseParameter(object);
}

module.exports = R.curry(parseParameterObject);
