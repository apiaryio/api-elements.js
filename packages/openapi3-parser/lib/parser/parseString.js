const R = require('ramda');
const { isString, getValue } = require('../predicates');
const {
  createMemberValueNotStringWarning,
  createMemberValueNotStringError,
} = require('./annotations');

/**
 * Returns true iff the given member elements value is a string
 * @param member {MemberElement}
 * @returns {boolean}
 * @private
 */
const isValueString = R.compose(isString, getValue);

/**
 * Ensures that the given member value is a string, or return warning
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<StringElement>>}
 * @private
 */
const parseOptionalString = (namespace, name, member) => new namespace.elements.ParseResult([
  R.unless(
    isValueString,
    createMemberValueNotStringWarning(namespace, name),
    member
  ),
]);

/**
 * Ensures that the given member value is a string, or return error
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<StringElement>>}
 * @private
 */
const parseRequiredString = (namespace, name, member) => new namespace.elements.ParseResult([
  R.unless(
    isValueString,
    createMemberValueNotStringError(namespace, name),
    member
  ),
]);

/**
 * Parse a string from a member
 * @pram namespace
 * @pram name {string}
 * @pram required {boolean} - Whether the member is required, indicates if we return a warning or an error
 * @pram member {MemberElement}
 * @returns {ParseResult<MemberElement<StringElement>>}
 * @private
 */
function parseString(context, name, required, member) {
  const { namespace } = context;

  if (required) {
    return parseRequiredString(namespace, name, member);
  }

  return parseOptionalString(namespace, name, member);
}

module.exports = R.curry(parseString);
