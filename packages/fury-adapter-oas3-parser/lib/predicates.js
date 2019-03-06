const R = require('ramda');

/**
 * @module predicates
 * @private
 */

const isArray = element => element.element === 'array';
const isAnnotation = element => element.element === 'annotation';
const isMember = element => element.element === 'member';
const isObject = element => element.element === 'object';
const isParseResult = element => element.element === 'parseResult';
const isString = element => element.element === 'string';
const isBoolean = element => element.element === 'boolean';
const isNull = element => element.element === 'null';
const isDataStructure = element => element.element === 'dataStructure';

// Member

/**
 * Returns whether the given member matches the given key
 * @param key {string}
 * @param member {MemberElement}
 * @returns {boolean}
 * @private
 */
const hasKey = (key, member) => member.key.toValue() === key;

/**
 * Returns whether the given member matches the given value
 * @param value {string}
 * @param member {MemberElement}
 * @returns {boolean}
 * @private
 */
const hasValue = (value, member) => member.value.toValue() === value;

/**
 * Returns whether the given member element is a an OpenAPI extension.
 * @param member {MemberElement}
 * @returns {boolean}
 * @private
 */
const isExtension = member => member.key && isString(member.key) && member.key.toValue().startsWith('x-');

/**
 * Returns the key for the given member element
 * @param member {MemberElement}
 * @returns {Element}
 * @private
 */
const getKey = member => member.key;

/**
 * Returns the value for the given member element
 * @param member {MemberElement}
 * @returns {Element}
 * @private
 */
const getValue = member => member.value;

module.exports = {
  isArray,
  isAnnotation,
  isMember,
  isObject,
  isParseResult,
  isString,
  isBoolean,
  isNull,
  isDataStructure,

  hasKey: R.curry(hasKey),
  hasValue: R.curry(hasValue),
  isExtension,

  getKey,
  getValue,
};
