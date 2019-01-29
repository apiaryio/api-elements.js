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

const parseCopy = require('../parseCopy');

const name = 'Response Object';
const unsupportedKeys = [
  'headers', 'links',
];
const requiredKeys = [
  'description',
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
    [hasKey('description'), parseCopy(context, name, false)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseResponse = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys),
    (responseObject) => {
      // Try to fecth responses from the media type parsing
      // if not, create empty HttpResponse
      const responses = R.or(responseObject.get('content'), [new namespace.elements.HttpResponse()]);

      const description = responseObject.get('description');

      return new namespace.elements.ParseResult(responses.map((response) => {
        if (description) {
          response.push(description);
        }

        return response;
      }));
    });

  return parseResponse(element);
}

module.exports = R.curry(parseResponseObject);
