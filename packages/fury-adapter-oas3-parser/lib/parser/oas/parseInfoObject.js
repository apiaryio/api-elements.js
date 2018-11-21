const R = require('ramda');
const { createError } = require('../../elements');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  createMemberValueNotStringError,
  createMemberValueNotStringWarning,
  validateObjectContainsRequiredKeys,
} = require('../annotations');
const {
  isString, isObject, hasKey, isExtension, getValue,
} = require('../../predicates');
const parseObject = require('../parseObject');
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
function parseInfo(minim, info) {
  /**
   * Ensures that the given member value is a string, or return error
   *
   * @param member {MemberElement}
   *
   * @returns {Element} Either a MemberElement<String> or Annotation.
   */
  const memberIsStringOrError = R.unless(
    R.compose(isString, getValue),
    createMemberValueNotStringError(minim, name)
  );

  const parseDescription = parseCopy(minim,
    createMemberValueNotStringWarning(minim, name));

  const parseMember = R.cond([
    [hasKey('title'), memberIsStringOrError],
    [hasKey('version'), memberIsStringOrError],
    [hasKey('description'), parseDescription],
    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseInfo = pipeParseResult(minim,
    R.unless(isObject, createError(minim, `'${name}' is not an object`)),
    validateObjectContainsRequiredKeys(minim, name, requiredKeys),
    parseObject(minim, parseMember),
    (info) => {
      const api = new minim.elements.Category();
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
