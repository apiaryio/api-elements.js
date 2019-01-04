const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const { isObject, isExtension, hasKey } = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');

const name = 'Response Object';
const unsupportedKeys = [
  'description', 'headers', 'content', 'links',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Response Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#responseObject
 */
function parseResponseObject(namespace, element) {
  if (!element.key.toValue().match(/^\d\d\d$/)) {
    // FIXME Add support for status code ranges
    // https://github.com/apiaryio/fury-adapter-oas3-parser/issues/64
    return new namespace.elements.ParseResult([
      createWarning(namespace, `'${name}' response status code ranges are unsupported`, element),
    ]);
  }

  const parseMember = R.cond([
    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseResponse = pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    parseObject(namespace, parseMember),
    () => {
      const response = new namespace.elements.HttpResponse();
      response.statusCode = Number(element.key.toValue());
      return response;
    });

  return parseResponse(element.value);
}

module.exports = R.curry(parseResponseObject);
