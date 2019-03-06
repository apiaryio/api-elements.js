const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const {
  isObject,
  isExtension,
  hasKey,
  getValue,
} = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseMediaTypeObject = require('./parseMediaTypeObject');
const parseCopy = require('../parseCopy');

const name = 'Request Body Object';
const unsupportedKeys = [
  'required',
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
 * @private
 */
function parseRequestBodyObject(context, element) {
  const { namespace } = context;

  const validateIsObject = key => R.unless(isObject,
    createWarning(namespace, `'${name}' '${key}' is not an object`));

  const parseContent = pipeParseResult(namespace,
    validateIsObject('content'),
    parseObject(context, name, parseMediaTypeObject(context, namespace.elements.HttpRequest)),
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

  const parseRequestBodyObject = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (requestBodyObject) => {
      const requests = R.or(requestBodyObject.get('content'), [new namespace.elements.HttpRequest()]);
      const description = requestBodyObject.get('description');

      return new namespace.elements.ParseResult(requests.map((request) => {
        if (description) {
          request.push(description);
        }

        return request;
      }));
    });

  return parseRequestBodyObject(element);
}

module.exports = R.curry(parseRequestBodyObject);
