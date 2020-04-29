const R = require('ramda');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const { hasKey, isExtension } = require('../../predicates');
const parseObject = require('../parseObject');

const name = 'Example Object';
const unsupportedKeys = [
  'summary', 'description', 'externalValue',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Example Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#exampleObject
 * @private
 */
function parseExampleObject(context, element) {
  const { namespace } = context;

  const parseMember = R.cond([
    [hasKey('value'), R.identity],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return pipeParseResult(namespace,
    parseObject(context, name, parseMember))(element);
}

module.exports = R.curry(parseExampleObject);
