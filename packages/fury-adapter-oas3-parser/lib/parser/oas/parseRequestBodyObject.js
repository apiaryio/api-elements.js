const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const { isExtension, hasKey } = require('../../predicates');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseCopy = require('../parseCopy');

const name = 'Request Body Object';
const unsupportedKeys = [
  'content', 'required',
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
    [hasKey('description'), parseCopy(context, name, false)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseRequestBodyObject = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (requestBodyObject) => {
      const request = new namespace.elements.HttpRequest();
      const description = requestBodyObject.get('description');

      if (description) {
        request.push(description);
      }

      return request;
    });

  return parseRequestBodyObject(element);
}

module.exports = R.curry(parseRequestBodyObject);
