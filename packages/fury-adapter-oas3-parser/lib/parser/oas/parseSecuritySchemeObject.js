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
const parseOauthFlowsObject = require('./parseOauthFlowsObject');

const name = 'Security Scheme Object';
const requiredKeys = ['type'];
const unsupportedKeys = ['bearerFormat', 'openIdConnectUrl'];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));
const outerPassThrough = R.anyPass(R.map(hasKey, ['name', 'in', 'scheme', 'flows']));
const innerPassThrough = R.anyPass(R.map(hasKey, ['type', 'description']));

const isApiKeyScheme = securityScheme => securityScheme.getValue('type') === 'apiKey';
const isHttpScheme = securityScheme => securityScheme.getValue('type') === 'http';
const isOauth2Scheme = securityScheme => securityScheme.getValue('type') === 'oauth2';

const isValidTypeValue = R.anyPass(R.map(hasValue, ['apiKey', 'http', 'oauth2', 'openIdConnect']));
const isSupportedType = R.anyPass(R.map(hasValue, ['apiKey', 'http', 'oauth2']));
const isValidInValue = R.anyPass(R.map(hasValue, ['query', 'header', 'cookie']));

function validateApiKeyScheme(context, securityScheme) {
  const { namespace } = context;

  const createInvalidInWarning = R.compose(
    createWarning(namespace, `'${name}' 'in' must be either 'query', 'header' or 'cookie'`),
    getValue
  );
  const validateIn = R.unless(isValidInValue, createInvalidInWarning);

  const parseIn = pipeParseResult(namespace,
    parseString(context, name, false),
    validateIn);

  const parseMember = R.cond([
    [hasKey('name'), parseString(context, name, false)],
    [hasKey('in'), parseIn],

    [innerPassThrough, e => e],
    [isUnsupportedKey, e => e],
    [isExtension, e => e],

    [R.T, createInvalidMemberWarning(namespace, `${name}' 'apiKey`)],
  ]);

  return parseObject(context, name, parseMember, ['name', 'in'], [], true)(securityScheme);
}

function validateHttpScheme(context, securityScheme) {
  const { namespace } = context;

  const schemes = ['bearer', 'basic'];
  const isValidScheme = R.anyPass(R.map(hasValue, schemes));
  const createInvalidSchemeWarning = scheme => createWarning(
    namespace,
    `'${name}' 'http' contains unsupported scheme '${scheme.value.toValue()}', supported schemes ${schemes.join(', ')}`,
    scheme.value
  );

  const parseScheme = pipeParseResult(namespace,
    parseString(context, name, false),
    R.unless(isValidScheme, createInvalidSchemeWarning));

  const parseMember = R.cond([
    [hasKey('scheme'), parseScheme],

    [innerPassThrough, e => e],
    [isUnsupportedKey, e => e],
    [isExtension, e => e],

    [R.T, createInvalidMemberWarning(namespace, `${name}' 'http`)],
  ]);

  return parseObject(context, name, parseMember, ['scheme'], [], true)(securityScheme);
}

function validateOauth2Scheme(context, securityScheme) {
  const { namespace } = context;

  const parseMember = R.cond([
    [hasKey('flows'), R.compose(parseOauthFlowsObject(context), getValue)],

    [innerPassThrough, e => e],
    [isUnsupportedKey, e => e],
    [isExtension, e => e],

    [R.T, createInvalidMemberWarning(namespace, `${name}' 'oauth2`)],
  ]);

  return parseObject(context, name, parseMember, ['flows'], [], true)(securityScheme);
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
    [outerPassThrough, e => e],

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
    R.when(isOauth2Scheme, R.curry(validateOauth2Scheme)(context)),
    (securityScheme) => {
      const authScheme = new namespace.elements.AuthScheme();

      const type = securityScheme.getValue('type');
      const scheme = securityScheme.getValue('scheme');
      const description = securityScheme.get('description');

      if (type === 'oauth2') {
        const flows = securityScheme.get('flows');

        if (description) {
          flows.forEach((flow) => {
            // eslint-disable-next-line no-param-reassign
            flow.description = description.clone();
          });
        }

        return flows;
      }

      if (type === 'apiKey' || (type === 'http' && scheme === 'bearer')) {
        authScheme.element = 'Token Authentication Scheme';
      } else if (type === 'http' && scheme === 'basic') {
        authScheme.element = 'Basic Authentication Scheme';
      } else {
        throw new Error(`Invalid security Scheme '${type}' '${scheme}'`);
      }

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
        } else if (inValue === 'cookie') {
          key = 'cookieName';
        }

        authScheme.push(new namespace.elements.Member(key, securityScheme.get('name')));
      }

      return authScheme;
    });

  return parseSecurityScheme(object);
}

module.exports = R.curry(parseSecuritySchemeObject);
