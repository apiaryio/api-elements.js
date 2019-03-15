const R = require('ramda');
const {
  isExtension, hasKey, getValue,
} = require('../../predicates');
const {
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');

const name = 'Oauth Flow Object';
const requiredKeys = ['scopes'];

/**
 * Parse Oauth Flow Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#oauthFlowObject
 * @private
 */
function parseOauthFlowObject(context, object) {
  const { namespace } = context;
  const scopesName = `${name}' 'scopes`;

  const parseScopeMember = R.cond([
    [R.T, parseString(context, scopesName, false)],
  ]);

  const parseScopes = pipeParseResult(namespace,
    parseObject(context, scopesName, parseScopeMember, [], true),
    scopes => new namespace.elements.Array(scopes.content),
    R.map((member) => {
      const scope = member.key.clone();
      scope.description = member.value;

      return scope;
    }));

  const parseMember = R.cond([
    [hasKey('scopes'), R.compose(parseScopes, getValue)],
    [hasKey('refreshUrl'), parseString(context, name, false)],
    [hasKey('authorizationUrl'), parseString(context, name, false)],
    [hasKey('tokenUrl'), parseString(context, name, false)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOauthFlow = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys, true));

  return parseOauthFlow(object);
}

module.exports = R.curry(parseOauthFlowObject);
