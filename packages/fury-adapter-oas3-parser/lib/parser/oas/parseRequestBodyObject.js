const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const { isExtension, hasKey } = require('../../predicates');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');

const name = 'Request Body Object';
const unsupportedKeys = [
  'description', 'content', 'required',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Request Body Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject
 */
function parseRequestBodyObject(context, element) {
  const { namespace } = context;

  const parseMember = R.cond([
    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseRequestBodyObject = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    () => new namespace.elements.HttpRequest());

  return parseRequestBodyObject(element);
}

module.exports = R.curry(parseRequestBodyObject);
