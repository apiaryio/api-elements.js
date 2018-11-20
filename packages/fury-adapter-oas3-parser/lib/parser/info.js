const R = require('ramda');
const { createError } = require('../elements');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  createMemberValueNotStringError,
  createMemberValueNotStringWarning,
  validateObjectContainsRequiredKeys,
  validateMembers,
} = require('./annotations');
const { isString, isObject, hasKey, isExtension, getValue } = require('../predicates');
const pipeParseResult = require('../pipeParseResult');

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
 * Returns a clone of the value of a member
 * @param member {MemberElement}
 * @returns {Element}
 */
const cloneValue = member => member.value.clone();

/**
 * Parse the OpenAPI 'Info Object' (`#/info`)
 * @see https://github.com/OAI/OpenAPI-Specification/blob/50c152549263cda0f05608d514ba78546b390d0e/versions/3.0.0.md#infoObject
 * @returns ParseResult<Category>
 */
function parseInfo(minim, info) {
  const createCopy = element => {
    const copy = new minim.elements.Copy(element.content);
    // FIXME no tests for sourcemap copy
    copy.attributes.set('sourceMap', element.attributes.get('sourceMap'));
    return copy;
  }

  /**
   * Ensures that the given member value is a string, or return error
   *
   * @param member {MemberElement}
   *
   * @returns {Element} Either a MemberElement<String> or Annotation.
   */
  const memberIsStringOrError = R.unless(
    R.compose(isString, getValue),
    createMemberValueNotStringError(minim, name));

  /**
   * Parse Description
   *
   * @param member {MemberElement}
   *
   * @returns {Element} Either a MemberElement<Copy> or Annotation.
   */
  const parseDescription = R.ifElse(
    // If the member value is string
    R.compose(isString, getValue),

    // Create a CopyElement from the members value
    R.compose(createCopy, getValue),

    // Member value not string, return annotation
    createMemberValueNotStringWarning(minim, name));

  const parseMember = R.cond([
    [hasKey('title'), memberIsStringOrError],
    [hasKey('version'), memberIsStringOrError],
    [hasKey('description'), parseDescription],
    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseInfo = pipeParseResult(minim,
    R.unless(isObject, createError(minim, `'${name}' is not an object`)),
    validateObjectContainsRequiredKeys(minim, name, requiredKeys),
    validateMembers(minim, parseMember),
    (info) => {
      const api = new minim.elements.Category();
      api.classes = ['api'];
      api.title = info.get('title');
      api.attributes.set('version', info.get('version'));

      if (info.get('description')) {
        api.push(info.get('description'));
      }

      return api;
    }
  );

  return parseInfo(info);
}

module.exports = R.curry(parseInfo);
