/* eslint-disable no-underscore-dangle */
const R = require('ramda');

const {
  StringElement,
  BooleanElement,
  NumberElement,
  NullElement,
} = require('minim');

/**
 * Get element attribute
 * @param {element} e - element - element
 * @param {string} attribute
 * @return {element}
 */
const getAttribute = (e, attribute) => e._attributes && e.attributes.get(attribute);

/**
 * Check if element has a typeAttribute
 * @param {element} e - element
 * @param {string} attribute
 * @return {boolean}
 */
function hasTypeAttribute(e, attribute) {
  const typeAttributes = getAttribute(e, 'typeAttributes');
  if (typeAttributes) {
    return typeAttributes.includes(attribute);
  }

  return false;
}

/**
 * Check if element has 'fixed' typeAttribute set
 * @param {element} e - element
 * @return {boolean}
 */
const isFixed = e => hasTypeAttribute(e, 'fixed');

/**
 * Check if element has 'fixedType' typeAttribute set
 * @param {element} e - element
 * @return {boolean}
 */
const isFixedType = e => hasTypeAttribute(e, 'fixedType');

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

const baseTypes = new Set([
  'boolean',
  'string',
  'number',
  'array',
  'object',
  'enum',
  'null',
  'member',
  'select',
  'option',
  'extend',
  'ref',
  'link',
]);
/**
 * Check if element is one of the base types
 * @param {element} e - element
 * @return {boolean}
 */
const isBaseType = e => baseTypes.has(e && e.element);

/**
 * Get the element type - prefer a base type, if found
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {string}
 */
const getType = (e, elements) => {
  if (e === undefined) {
    return undefined;
  }
  if (isBaseType(e)) {
    return e.element;
  }

  const inheritedType = e.element && elements && elements[e.element];
  if (inheritedType !== undefined) {
    return getType(inheritedType, elements);
  }

  return e && e.element;
};

const primitives = new Set(['string', 'number', 'boolean', 'null']);
/**
 * Check if the element is of a primitive type
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isPrimitive = (e, elements) => {
  const type = getType(e, elements);
  return primitives.has(String(type));
};

/**
 * Check if the element type is Enum
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isEnum = (e, elements) => getType(e, elements) === 'enum';

/**
 * Check if the element type is Array
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isArray = (e, elements) => getType(e, elements) === 'array';

/**
 * Check if the element type is Object
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isObject = (e, elements) => getType(e, elements) === 'object';

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
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isNoValuePrimitive = (e, elements) => isPrimitive(e, elements) && hasNoValue(e);

/**
 * Check if the element type is array and is not empty
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isNonEmptyArray = (e, elements) => isArray(e, elements) && e.content !== undefined && !e.isEmpty;

/**
 * Check if the element type is array and has only primitive elements with no value
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isEmptyArray = (e, elements) => isArray(e, elements)
  && (e.content === undefined || e.content.every(member => isNoValuePrimitive(member, elements)));

/**
 * Check if the element type is 'ref'
 * @param {element} e - element
 * @return {boolean}
 */
const isRef = e => e && e.element === 'ref';

/**
 * Check if the element type is object and has all property values undefined
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {boolean}
 */
const isObjectWithUndefinedValues = (e, elements) => isObject(e, elements) && e.content.every(
  prop => prop.value === undefined || prop.value.content === undefined
);

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

/**
 * Get a key for the element member
 * This is used to identify each member on the Map, allowing overrides in Objects
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {(string|number|object|null)} - Map key
 */
function getMemberKey(e, elements) {
  if (isPrimitive(e, elements)) {
    // return unique identifier
    return Math.random();
  }

  const key = e && e.content && e.content.key && e.content.key.toValue();
  const content = e && e.content;
  const type = e.element;

  return key || content || type;
}

/**
 * Get an Array with the element members
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {element[]} - element members
 */
function getMembers(e, elements) {
  if (e === undefined) {
    return [];
  }

  if (isEnum(e, elements)) {
    const enumerations = getAttribute(e, 'enumerations');
    if (enumerations && enumerations.content !== undefined) {
      return enumerations.content;
    }
  }

  if (Array.isArray(e.content)) {
    return e.content;
  }

  return [e];
}

/**
 * Get a Map with all the element members, including references
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {Map<element>} - element members
 */
function getAllMembersMap(e, elements) {
  if (e === undefined) {
    return new Map();
  }

  const typeElement = elements && elements[e.element];
  const typeMembersMap = getAllMembersMap(typeElement, elements);
  const ownMembers = getMembers(e, elements);
  const ownMembersMap = new Map();

  ownMembers.forEach((member) => {
    if (isRef(member)) {
      const refElement = elements && elements[member.content];
      const refMembersMap = getAllMembersMap(refElement, elements);
      refMembersMap.forEach((refMember) => {
        ownMembersMap.set(getMemberKey(refMember, elements), refMember);
      });
    } else {
      ownMembersMap.set(getMemberKey(member, elements), member);
    }
  });
  return new Map([...typeMembersMap, ...ownMembersMap]);
}

/**
 * Get an Array with all the element members, including references
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited type
 * @return {element[]} - element members
 */
function getStructureMembers(e, elements) {
  const membersMap = getAllMembersMap(e, elements);

  return Array.from(membersMap.values());
}

module.exports = {
  isFixed,
  isFixedType,
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
  getStructureMembers,
};
