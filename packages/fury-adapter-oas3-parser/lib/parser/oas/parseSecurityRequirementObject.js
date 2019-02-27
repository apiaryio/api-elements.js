const R = require('ramda');
const {
  isArray,
} = require('../../predicates');
const { createWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');

const name = 'Security Requirement Object';

const isArrayValue = member => isArray(member.value);

/**
 * Parse Security Requirement Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securityRequirementObject
 */
function parseSecurityRequirementObject(context, object) {
  const { namespace } = context;

  const createNonArrayWarning = member => createWarning(namespace,
    `'${name}' '${member.key.toValue()}' is not an array`, member.value);

  const parseValue = pipeParseResult(namespace,
    R.unless(isArrayValue, createNonArrayWarning),
    member => member);

  const parseMember = R.cond([
    [R.T, parseValue],
  ]);

  const parseSecurityRequirement = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (securityRequirement) => {
      const arr = new namespace.elements.Array([]);

      securityRequirement.forEach((value, key) => {
        let e;
        const scopes = value.map(scope => scope.toValue());

        if (scopes.length) {
          e = new namespace.elements.Object({ scopes });
        } else {
          e = new namespace.elements.Object({});
        }

        e.element = key.toValue();
        arr.push(e);
      });

      return arr;
    });

  return parseSecurityRequirement(object);
}

module.exports = R.curry(parseSecurityRequirementObject);
