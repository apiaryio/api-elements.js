const R = require('ramda');
const {
  isExtension, hasKey, getValue,
} = require('../../predicates');
const {
  createWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseOauthFlowObject = require('./parseOauthFlowObject');

const name = 'Oauth Flows Object';

const isValidFlow = R.anyPass(R.map(hasKey, ['implicit', 'password', 'clientCredentials', 'authorizationCode']));
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

    const needAuthorizationUrl = () => R.includes(key, ['implicit', 'authorizationCode']);
    const needTokenUrl = () => R.includes(key, ['password', 'clientCredentials', 'authorizationCode']);

    const hasAuthorizationUrl = flow => flow.get('authorizationUrl');
    const hasTokenUrl = flow => flow.get('tokenUrl');

    const parse = pipeParseResult(namespace,
      R.compose(parseOauthFlowObject(context), getValue),
      R.when(R.allPass([R.complement(hasAuthorizationUrl), needAuthorizationUrl]), () => createWarning(namespace,
        `'${name}' '${key}' is missing required property 'authorizationUrl'`, member)),
      R.when(R.allPass([R.complement(hasTokenUrl), needTokenUrl]), () => createWarning(namespace,
        `'${name}' '${key}' is missing required property 'tokenUrl'`, member)));

    return parse(member);
  };

  const parseMember = R.cond([
    [isValidFlow, parseFlow],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOauthFlows = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    flows => new namespace.elements.Array(flows.content),
    R.map((member) => {
      const authScheme = new namespace.elements.AuthScheme();

      authScheme.element = 'Oauth2 Scheme';
      authScheme.push(new namespace.elements.Member('grantType', grantTypes[member.key.toValue()]));
      authScheme.push(member.value.getMember('scopes'));

      R.filter(R.is(namespace.elements.Transition), member.value).forEach((item) => {
        authScheme.push(item);
      });

      return authScheme;
    }));

  return parseOauthFlows(object);
}

module.exports = R.curry(parseOauthFlowsObject);
