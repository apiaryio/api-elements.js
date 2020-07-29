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
const parseOptionalString = (context, name, member) => new context.namespace.elements.ParseResult([
  R.unless(
    isValueString,
    createMemberValueNotStringWarning(context, name),
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
const parseRequiredString = (context, name, member) => new context.namespace.elements.ParseResult([
  R.unless(
    isValueString,
    createMemberValueNotStringError(context, name),
    member
  ),
]);

/**
 * Parse a string from a member
 * @pram context
 * @pram name {string}
 * @pram required {boolean} - Whether the member is required, indicates if we return a warning or an error
 * @pram member {MemberElement}
 * @returns {ParseResult<MemberElement<StringElement>>}
 * @private
 */
function parseString(context, name, required, member) {
  if (required) {
    return parseRequiredString(context, name, member);
  }

  return parseOptionalString(context, name, member);
}

module.exports = R.curry(parseString);
