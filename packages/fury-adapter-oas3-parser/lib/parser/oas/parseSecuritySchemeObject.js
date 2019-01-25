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

const name = 'Security Scheme Object';
const requiredKeys = ['type'];
const unsupportedKeys = [
  'scheme', 'bearerFormat', 'flows', 'openIdConnectUrl',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Security Scheme Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securitySchemeObject
 */
function parseSecuritySchemeObject(context, object) {
  const { namespace } = context;

  const isValidTypeValue = R.anyPass([
    hasValue('apiKey'), hasValue('http'), hasValue('oauth2'), hasValue('openIdConnect'),
  ]);
  const createInvalidTypeError = R.compose(
    createError(namespace, `'${name}' 'type' must be either 'apiKey', 'http', 'oauth2' or 'openIdConnect'`),
    getValue
  );
  const validateType = R.unless(isValidTypeValue, createInvalidTypeError);

  const isSupportedType = R.anyPass([
    hasValue('apiKey'),
  ]);
  const createUnsupportedTypeWarning = member => createWarning(namespace,
    `'${name}' 'type' '${member.value.toValue()}' is unsupported`, member.value);
  const ensureSupportedType = R.unless(isSupportedType, createUnsupportedTypeWarning);

  const parseType = pipeParseResult(namespace,
    parseString(context, name, true),
    validateType,
    ensureSupportedType);

  const isValidInValue = R.anyPass([
    hasValue('query'), hasValue('header'), hasValue('cookie'),
  ]);
  const createInvalidInError = R.compose(
    createError(namespace, `'${name}' 'in' must be either 'query', 'header' or 'cookie'`),
    getValue
  );
  const validateIn = R.unless(isValidInValue, createInvalidInError);

  const isSupportedIn = R.anyPass([
    hasValue('query'), hasValue('header'),
  ]);
  const createUnsupportedInWarning = member => createWarning(namespace,
    `'${name}' 'in' '${member.value.toValue()}' is unsupported`, member.value);
  const ensureSupportedIn = R.unless(isSupportedIn, createUnsupportedInWarning);

  const parseIn = pipeParseResult(namespace,
    parseString(context, name, true),
    validateIn,
    ensureSupportedIn);

  const parseMember = R.cond([
    [hasKey('type'), parseType],
    [hasKey('description'), parseString(context, name, false)],
    [hasKey('name'), parseString(context, name, false)],
    [hasKey('in'), parseIn],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseSecurityScheme = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys),
    (securityScheme) => {
      const authScheme = new namespace.elements.AuthScheme();

      const description = securityScheme.get('description');
      if (description) {
        authScheme.description = description;
      }

      authScheme.meta.id = securityScheme.get('name');

      return authScheme;
    });

  return parseSecurityScheme(object);
}

module.exports = R.curry(parseSecuritySchemeObject);
