/* eslint-disable no-underscore-dangle */

const R = require('ramda');
const {
  ArrayElement,
  ObjectElement,
  StringElement,
  BooleanElement,
  NumberElement,
  NullElement,
} = require('minim');

const EnumElement = require('./elements/Enum');

/**
 * Check if element has a typeAttribute
 * @param {element} e - element
 * @param {string} attribute
 * @return {boolean}
 */
function hasTypeAttribute(e, attribute) {
  const typeAttributes = e._attributes && e.attributes.get('typeAttributes');
  if (typeAttributes) {
    return typeAttributes.includes(attribute);
  }

  return false;
}

/**
 * Check if element has 'fixed' or 'fixedType' typeAttribute set
 * @param {element} e - element
 * @return {boolean}
 */
const isFixed = e => hasTypeAttribute(e, 'fixed') || hasTypeAttribute(e, 'fixedType');

/**
 * Check if element has 'required' typeAttribute set
 * @param {element} e - element
 * @return {boolean}
 */
const isRequired = e => hasTypeAttribute(e, 'required');

/**
 * Check if element has 'nullable' typeAttribute set
 * @param {element} e - element
 * @return {boolean}
 */
const isNullable = e => hasTypeAttribute(e, 'nullable');

/**
 * Check if element has 'optional' typeAttribute set
 * @param {element} e - element
 * @return {boolean}
 */
const isOptional = e => hasTypeAttribute(e, 'optional');

/**
 * Check if the element is of a primitive type
 * @param {element} e - element
 * @return {boolean}
 */
const isPrimitive = e => (e instanceof StringElement) || (e instanceof NumberElement) || (e instanceof BooleanElement);

/**
 * Check if the element type is Enum
 * @param {element} e - element
 * @return {boolean}
 */
const isEnum = e => e instanceof EnumElement;

/**
 * Check if the element type is Array
 * @param {element} e - element
 * @return {boolean}
 */
const isArray = e => e instanceof ArrayElement;

/**
 * Check if the element type is Object
 * @param {element} e - element
 * @return {boolean}
 */
const isObject = e => e instanceof ObjectElement;

/**
 * Get the element default
 * @param {element} e - element
 * @return {?element}
 */
function getDefault(e) {
  const result = e._attributes && e.attributes.get('default');
  if (result !== undefined) {
    return result;
  }

  return null;
}

/**
 * Get the element first sample
 * @param {element} e - element
 * @return {?element}
 */
function getFirstSample(e) {
  const samples = e._attributes && e.attributes.get('samples');
  if (isArray(samples) && samples.content && !samples.isEmpty) {
    return samples.content[0];
  }

  return null;
}

/**
 * Check if the element has a sample
 * @param {element} e - element
 * @return {boolean}
 */
const hasSample = e => getFirstSample(e) !== null;

/**
 * Check if the element has a default
 * @param {element} e - element
 * @return {boolean}
 */
const hasDefault = e => getDefault(e) !== null;

/**
 * Check if the element has content
 * @param {element} e - element
 * @return {boolean}
 */
const hasContent = e => e.content !== undefined;

/**
 * Check if the element has value (content/sample/default)
 * @param {element} e - element
 * @return {boolean}
 */
const hasValue = R.anyPass([hasContent, hasSample, hasDefault]);

/**
 * Check if the element has no value (content/sample/default)
 * @param {element} e - element
 * @return {boolean}
 */
const hasNoValue = R.complement(hasValue);

/**
 * Check if the element is of a primitive type and has no value (content/sample/default)
 * @param {element} e - element
 * @return {boolean}
 */
const isNoValuePrimitive = R.both(isPrimitive, hasNoValue);

/**
 * Check if the element type is array and is not empty
 * @param {element} e - element
 * @return {boolean}
 */
const isNonEmptyArray = e => isArray(e) && e.content && !e.isEmpty;

/**
 * Check if the element type is array and has only primitive elements with no value
 * @param {element} e - element
 * @return {boolean}
 */
const isEmptyArray = e => isArray(e) && e.content.every(isNoValuePrimitive);

/**
 * Check if the element type is 'ref'
 * @param {element} e - element
 * @return {boolean}
 */
const isRef = e => e && e.element === 'ref';

/**
 * Check if the element type is object and has all property values undefined
 * @param {element} e - element
 * @return {boolean}
 */
const isObjectWithUndefinedValues = e => isObject(e)
  && e.content.every(prop => prop.value === undefined || prop.value.content === undefined);

/**
 * Get a trivial value, to fill the unset, according to the element type
 * @param {element} e - element
 * @return {element|undefined}
 */
function trivialValue(e) {
  if (e instanceof BooleanElement) {
    return new BooleanElement(false);
  }

  if (e instanceof NumberElement) {
    return new NumberElement(0);
  }

  if (e instanceof StringElement) {
    return new StringElement('');
  }

  if (e instanceof NullElement) {
    return new NullElement();
  }

  return undefined;
}

module.exports = {
  isFixed,
  isRequired,
  isNullable,
  isOptional,
  isPrimitive,
  isEnum,
  isArray,
  isObject,
  getDefault,
  getFirstSample,
  isNonEmptyArray,
  isEmptyArray,
  isRef,
  isObjectWithUndefinedValues,
  trivialValue,
};
