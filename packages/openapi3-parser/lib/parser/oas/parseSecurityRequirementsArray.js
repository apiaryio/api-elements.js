const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const parseArray = require('../parseArray');
const parseSecurityRequirementObject = require('./parseSecurityRequirementObject');

const name = 'Security Requirements Array';

/**
 * Parse Security Requirements Array
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @private
 */
function parseSecurityRequirementsArray(context, element) {
  const { namespace } = context;

  const parseSecurityRequirements = pipeParseResult(namespace,
    parseArray(context, name, R.curry(parseSecurityRequirementObject)(context)),
    requirements => requirements.map((requirement) => {
      if (requirement.length === 1) {
        return requirement.get(0);
      }

      const link = new namespace.elements.Link();
      link.relation = 'profile';
      link.href = 'https://github.com/refractproject/rfcs/issues/39';

      const allOf = new namespace.elements.Extension(requirement.content);
      allOf.meta.set('links', new namespace.elements.Array([link]));

      return allOf;
    }));

  return parseSecurityRequirements(element);
}

module.exports = R.curry(parseSecurityRequirementsArray);
