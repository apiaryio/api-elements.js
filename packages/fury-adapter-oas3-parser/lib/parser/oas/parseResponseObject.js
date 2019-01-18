const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const {
  isObject, isExtension, hasKey, getValue,
} = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseMediaTypeObject = require('./parseMediaTypeObject');

const name = 'Response Object';
const unsupportedKeys = [
  'description', 'headers', 'links',
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
function parseResponseObject(context, element) {
  const { namespace } = context;

  if (!element.key.toValue().match(/^\d\d\d$/)) {
    // FIXME Add support for status code ranges
    // https://github.com/apiaryio/fury-adapter-oas3-parser/issues/64

    let message;

    if (element.key.toValue() === 'default') {
      message = `'${name}' default responses unsupported`;
    } else {
      message = `'${name}' response status code ranges are unsupported`;
    }

    return new namespace.elements.ParseResult([
      createWarning(namespace, message, element),
    ]);
  }

  const validateIsObject = key => R.unless(isObject,
    createWarning(namespace, `'${name}' '${key}' is not an object`));

  const parseContent = pipeParseResult(namespace,
    validateIsObject('content'),
    parseObject(context, name, parseMediaTypeObject(context, namespace.elements.HttpResponse)),
    mediaTypes => new namespace.elements.ParseResult([
      mediaTypes.content.map(getValue),
    ]));

  const parseMember = R.cond([
    [hasKey('content'), R.compose(parseContent, getValue)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseResponse = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (responseObject) => {
      const responses = responseObject.get('content');

      if (responses) {
        // If we have responses from the media type parsing, return those
        // after attaching Response Object information
        return new namespace.elements.ParseResult(responses.map((response) => {
          response.statusCode = element.key.toValue();
          return response;
        }));
      }

      // No media types defined in content, return empty response
      const response = new namespace.elements.HttpResponse();
      response.statusCode = element.key.toValue();
      return response;
    });

  return parseResponse(element.value);
}

module.exports = R.curry(parseResponseObject);
