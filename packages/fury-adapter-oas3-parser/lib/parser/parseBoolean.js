const R = require('ramda');
const { isBoolean, getValue } = require('../predicates');
const {
  createMemberValueNotBooleanWarning,
  createMemberValueNotBooleanError,
} = require('./annotations');

/**
 * Returns true iff the given member elements value is a boolean
 * @param member {MemberElement}
 * @returns {boolean}
 */
const isValueBoolean = R.compose(isBoolean, getValue);

/**
 * Ensures that the given member value is a boolean, or return error
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<BooleanElement>>}
 */
const parseOptionalBoolean = (minim, name, member) => new minim.elements.ParseResult([
  R.unless(
    isValueBoolean,
    createMemberValueNotBooleanWarning(minim, name),
    member
  ),
]);

/**
 * Ensures that the given member value is a boolean, or return error
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<BooleanElement>>}
 */
const parseRequiredBoolean = (minim, name, member) => new minim.elements.ParseResult([
  R.unless(
    isValueBoolean,
    createMemberValueNotBooleanError(minim, name),
    member
  ),
]);

/**
 * Parse a boolean from a member
 * @pram minim
 * @pram name {string}
 * @pram required {boolean} - Whether the member is required, indicates if we return a warning or an error
 * @pram member {MemberElement}
 * @returns {ParseResult<MemberElement<BooleanElement>>}
 */
function parseBoolean(minim, name, required, member) {
  if (required) {
    return parseRequiredBoolean(minim, name, member);
  }

  return parseOptionalBoolean(minim, name, member);
}

module.exports = R.curry(parseBoolean);
