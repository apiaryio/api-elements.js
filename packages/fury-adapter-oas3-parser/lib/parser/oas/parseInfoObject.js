const R = require('ramda');
const { createError } = require('../../elements');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  validateObjectContainsRequiredKeys,
} = require('../annotations');
const {
  isObject, hasKey, isExtension,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Info Object';
const requiredKeys = ['title', 'version'];
const unsupportedKeys = ['termsOfService', 'contact', 'license'];

/**
 * Returns whether the given member element is unsupported
 * @param member {MemberElement}
 * @returns {boolean}
 * @see unsupportedKeys
 */
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse the OpenAPI 'Info Object' (`#/info`)
 * @see https://github.com/OAI/OpenAPI-Specification/blob/50c152549263cda0f05608d514ba78546b390d0e/versions/3.0.0.md#infoObject
 * @returns ParseResult<Category>
 */
function parseInfo(context, info) {
  const { namespace } = context;

  const parseMember = R.cond([
    [hasKey('title'), parseString(context, name, true)],
    [hasKey('version'), parseString(context, name, true)],
    [hasKey('description'), parseCopy(context, name, false)],
    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseInfo = pipeParseResult(namespace,
    R.unless(isObject, createError(namespace, `'${name}' is not an object`)),
    validateObjectContainsRequiredKeys(namespace, name, requiredKeys),
    parseObject(context, name, parseMember),
    (info) => {
      const api = new namespace.elements.Category();
      api.classes = ['api'];
      api.title = info.get('title');
      api.attributes.set('version', info.get('version'));

      if (info.get('description')) {
        api.push(info.get('description'));
      }

      return api;
    });

  return parseInfo(info);
}

module.exports = R.curry(parseInfo);
