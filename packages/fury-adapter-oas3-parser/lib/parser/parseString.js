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
 */
const isValueString = R.compose(isString, getValue);

/**
 * Ensures that the given member value is a string, or return error
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<StringElement>>}
 */
const parseOptionalString = (minim, name, member) => new minim.elements.ParseResult([
  R.unless(
    isValueString,
    createMemberValueNotStringWarning(minim, name),
    member
  ),
]);

/**
 * Ensures that the given member value is a string, or return error
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<StringElement>>}
 */
const parseRequiredString = (minim, name, member) => new minim.elements.ParseResult([
  R.unless(
    isValueString,
    createMemberValueNotStringError(minim, name),
    member
  ),
]);

/**
 * Parse a string from a member
 * @pram minim
 * @pram name {string}
 * @pram required {boolean} - Whether the member is required, indicates if we return a warning or an error
 * @pram member {MemberElement}
 * @returns {ParseResult<MemberElement<StringElement>>}
 */
function parseString(minim, name, required, member) {
  if (required) {
    return parseRequiredString(minim, name, member);
  }

  return parseOptionalString(minim, name, member);
}

module.exports = R.curry(parseString);
