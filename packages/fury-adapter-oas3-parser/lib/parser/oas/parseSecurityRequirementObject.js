const R = require('ramda');
const { isString } = require('../../predicates');
const { createWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseArray = require('../parseArray');

const name = 'Security Requirement Object';

/**
 * Parse Security Requirement Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securityRequirementObject
 * @private
 */
function parseSecurityRequirementObject(context, object) {
  const { namespace } = context;

  const parseScopes = (member) => {
    const key = member.key.toValue();

    const createScopeNotStringWarning = createWarning(namespace,
      `'${name}' '${key}' array value is not a string`);

    const parseScope = pipeParseResult(namespace,
      R.unless(isString, createScopeNotStringWarning),
      value => value);

    return parseArray(context, `${name}' '${key}`, parseScope)(member.value);
  };

  const parseMember = R.cond([
    [R.T, parseScopes],
  ]);

  const parseSecurityRequirement = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (securityRequirement) => {
      const parseResult = new namespace.elements.ParseResult([]);
      const array = new namespace.elements.Array([]);

      securityRequirement.forEach((value, key) => {
        let e;
        const schemeName = key.toValue();

        const scopes = value.map(scope => scope.toValue());

        if (scopes.length) {
          e = new namespace.elements.AuthScheme({ scopes });
        } else {
          e = new namespace.elements.AuthScheme({});
        }

        // Expand oauth2 flows
        const hasFlows = context.state.oauthFlows[schemeName] || [];

        if (hasFlows.length !== 0) {
          hasFlows.forEach((flow) => {
            const element = e.clone();
            element.element = flow;
            array.push(element);
          });

          return;
        }

        if (!context.hasScheme(schemeName)) {
          parseResult.push(createWarning(namespace, `'${schemeName}' security scheme not found`, key));
        } else {
          e.element = schemeName;
          array.push(e);
        }
      });

      if (!array.isEmpty) {
        parseResult.push(array);
      }

      return parseResult;
    });

  return parseSecurityRequirement(object);
}

module.exports = R.curry(parseSecurityRequirementObject);
