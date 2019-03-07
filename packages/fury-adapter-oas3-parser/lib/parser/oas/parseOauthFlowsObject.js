const R = require('ramda');
const {
  isAnnotation, isExtension, hasKey,
} = require('../../predicates');
const {
  createWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseOauthFlowObject = require('./parseOauthFlowObject');

const name = 'Oauth Flows Object';

const validFlow = R.anyPass(R.map(hasKey, ['implicit', 'password', 'clientCredentials', 'authorizationCode']));
const grantTypes = {
  implicit: 'implicit',
  password: 'resource owner password credentials',
  clientCredentials: 'client credentials',
  authorizationCode: 'authorization code',
};

/**
 * Parse Oauth Flows Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#oauthFlowsObject
 * @private
 */
function parseOauthFlowsObject(context, object) {
  const { namespace } = context;

  const parseFlow = (member) => {
    const key = member.key.toValue();
    const flow = parseOauthFlowObject(context, member.value);

    if (flow.length === 0 || isAnnotation(flow.get(0))) {
      return flow;
    }

    if (['implicit', 'authorizationCode'].includes(key) && !flow.get(0).get('authorizationUrl')) {
      return createWarning(namespace,
        `'${name}' '${key}' is missing required property 'authorizationUrl'`, member);
    }

    if (['password', 'clientCredentials', 'authorizationCode'].includes(key) && !flow.get(0).get('tokenUrl')) {
      return createWarning(namespace,
        `'${name}' '${key}' is missing required property 'tokenUrl'`, member);
    }

    return flow;
  };

  const parseMember = R.cond([
    [validFlow, parseFlow],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOauthFlows = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (oauthFlows) => {
      const arr = new namespace.elements.Array();

      oauthFlows.forEach((value, key) => {
        const authScheme = new namespace.elements.AuthScheme();

        authScheme.element = 'Oauth2 Scheme';
        authScheme.push(new namespace.elements.Member('grantType', grantTypes[key.toValue()]));
        authScheme.push(value.getMember('scopes'));

        arr.push(authScheme);
      });

      return arr;
    });

  return parseOauthFlows(object);
}

module.exports = R.curry(parseOauthFlowsObject);
