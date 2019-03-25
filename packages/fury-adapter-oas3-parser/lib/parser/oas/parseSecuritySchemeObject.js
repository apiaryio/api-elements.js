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

const name = 'Security Scheme Object';
const requiredKeys = ['type'];
const unsupportedKeys = [
  'bearerFormat', 'flows', 'openIdConnectUrl',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));
const passThrough = R.anyPass(R.map(hasKey, ['name', 'in', 'scheme']));

const isApiKeyScheme = securityScheme => securityScheme.getValue('type') === 'apiKey';
const isHttpScheme = securityScheme => securityScheme.getValue('type') === 'http';

const isValidTypeValue = R.anyPass([
  hasValue('apiKey'), hasValue('http'), hasValue('oauth2'), hasValue('openIdConnect'),
]);
const isSupportedType = R.anyPass([
  hasValue('apiKey'), hasValue('http'),
]);
const isValidInValue = R.anyPass([
  hasValue('query'), hasValue('header'), hasValue('cookie'),
]);
const isSupportedIn = R.anyPass([
  hasValue('query'), hasValue('header'),
]);

function validateApiKeyScheme(context, securityScheme) {
  const { namespace } = context;

  const createInvalidInWarning = R.compose(
    createWarning(namespace, `'${name}' 'in' must be either 'query', 'header' or 'cookie'`),
    getValue
  );
  const validateIn = R.unless(isValidInValue, createInvalidInWarning);

  const createUnsupportedInWarning = member => createWarning(namespace,
    `'${name}' 'in' '${member.value.toValue()}' is unsupported`, member.value);
  const ensureSupportedIn = R.unless(isSupportedIn, createUnsupportedInWarning);

  const parseIn = pipeParseResult(namespace,
    parseString(context, name, false),
    validateIn,
    ensureSupportedIn);

  const parseMember = R.cond([
    [hasKey('name'), parseString(context, name, false)],
    [hasKey('in'), parseIn],

    [R.T, e => e],
  ]);

  return parseObject(context, name, parseMember, ['name', 'in'], [], true)(securityScheme);
}

function validateHttpScheme(context, securityScheme) {
  const parseMember = R.cond([
    [hasKey('scheme'), parseString(context, name, false)],

    [R.T, e => e],
  ]);

  return parseObject(context, name, parseMember, ['scheme'], [], true)(securityScheme);
}

/**
 * Parse Security Scheme Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securitySchemeObject
 * @private
 */
function parseSecuritySchemeObject(context, object) {
  const { namespace } = context;

  const createInvalidTypeWarning = R.compose(
    createWarning(namespace, `'${name}' 'type' must be either 'apiKey', 'http', 'oauth2' or 'openIdConnect'`),
    getValue
  );
  const validateType = R.unless(isValidTypeValue, createInvalidTypeWarning);

  const createUnsupportedTypeWarning = member => createWarning(namespace,
    `'${name}' 'type' '${member.value.toValue()}' is unsupported`, member.value);
  const ensureSupportedType = R.unless(isSupportedType, createUnsupportedTypeWarning);

  const parseType = pipeParseResult(namespace,
    parseString(context, name, false),
    validateType,
    ensureSupportedType);

  const parseMember = R.cond([
    [hasKey('type'), parseType],
    [hasKey('description'), parseString(context, name, false)],
    [passThrough, e => e],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseSecurityScheme = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys, [], true),
    R.when(isApiKeyScheme, R.curry(validateApiKeyScheme)(context)),
    R.when(isHttpScheme, R.curry(validateHttpScheme)(context)),
    (securityScheme) => {
      const authScheme = new namespace.elements.AuthScheme();

      const type = securityScheme.getValue('type');
      const scheme = securityScheme.getValue('scheme');

      if (type === 'apiKey' || (type === 'http' && scheme === 'bearer')) {
        authScheme.element = 'Token Authentication Scheme';
      } else if (type === 'http' && scheme === 'basic') {
        authScheme.element = 'Basic Authentication Scheme';
      }

      const description = securityScheme.get('description');
      if (description) {
        authScheme.description = description;
      }

      if (type === 'apiKey') {
        const inValue = securityScheme.getValue('in');
        let key;

        if (inValue === 'header') {
          key = 'httpHeaderName';
        } else if (inValue === 'query') {
          key = 'queryParameterName';
        }

        authScheme.push(new namespace.elements.Member(key, securityScheme.get('name')));
      }

      return authScheme;
    });

  return parseSecurityScheme(object);
}

module.exports = R.curry(parseSecuritySchemeObject);
