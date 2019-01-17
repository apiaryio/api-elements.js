const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const { isObject, isExtension, hasKey } = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');

const name = 'Media Type Object';
const unsupportedKeys = [
  'schema', 'example', 'examples', 'encoding',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Media Type Object
 *
 * @param context {Context}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/50c152549263cda0f05608d514ba78546b390d0e/versions/3.0.0.md#media-type-object
 */
function parseMediaTypeObject(context, element) {
  const { namespace } = context;

  const parseMember = R.cond([
    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseMediaType = pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    parseObject(context, parseMember));

  return parseMediaType(element.value);
}

module.exports = R.curry(parseMediaTypeObject);

