const R = require('ramda');
const { isExtension, hasKey } = require('../../predicates');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');

const name = 'Header Object';
const unsupportedKeys = [
  'description', 'required', 'deprecated', 'allowEmptyValue',
  'style', 'explode', 'allowReserved', 'schema', 'content', 'example',
  'examples',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Header Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#headerObject
 * @private
 */
function parseHeaderObject(context, object) {
  const { namespace } = context;

  const parseMember = R.cond([
    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseHeader = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    () => {
      const result = new namespace.elements.String();
      return result;
    });

  return parseHeader(object);
}

module.exports = R.curry(parseHeaderObject);
