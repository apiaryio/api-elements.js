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
 * @private
 */
const isValueBoolean = R.compose(isBoolean, getValue);

/**
 * Ensures that the given member value is a boolean, or return error
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<BooleanElement>>}
 * @private
 */
const parseOptionalBoolean = (context, name, member) => new context.namespace.elements.ParseResult([
  R.unless(
    isValueBoolean,
    createMemberValueNotBooleanWarning(context.namespace, name),
    member
  ),
]);

/**
 * Ensures that the given member value is a boolean, or return error
 *
 * @param member {MemberElement}
 *
 * @returns {ParseResult<MemberElement<BooleanElement>>}
 * @private
 */
const parseRequiredBoolean = (context, name, member) => new context.namespace.elements.ParseResult([
  R.unless(
    isValueBoolean,
    createMemberValueNotBooleanError(context.namespace, name),
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
 * @private
 */
function parseBoolean(context, name, required, member) {
  if (required) {
    return parseRequiredBoolean(context, name, member);
  }

  return parseOptionalBoolean(context, name, member);
}

module.exports = R.curry(parseBoolean);
