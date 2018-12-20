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
const parseOptionalBoolean = (namespace, name, member) => new namespace.elements.ParseResult([
  R.unless(
    isValueBoolean,
    createMemberValueNotBooleanWarning(namespace, name),
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
const parseRequiredBoolean = (namespace, name, member) => new namespace.elements.ParseResult([
  R.unless(
    isValueBoolean,
    createMemberValueNotBooleanError(namespace, name),
    member
  ),
]);

/**
 * Parse a boolean from a member
 * @pram namespace
 * @pram name {string}
 * @pram required {boolean} - Whether the member is required, indicates if we return a warning or an error
 * @pram member {MemberElement}
 * @returns {ParseResult<MemberElement<BooleanElement>>}
 */
function parseBoolean(namespace, name, required, member) {
  if (required) {
    return parseRequiredBoolean(namespace, name, member);
  }

  return parseOptionalBoolean(namespace, name, member);
}

module.exports = R.curry(parseBoolean);
