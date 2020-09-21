/* eslint-disable no-underscore-dangle */

const R = require('ramda');
const {
  Element,
  NullElement,
} = require('minim');
const {
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
} = require('./utils');

/**
 * @typedef InheritedAttrs
 * @type {object}
 * @property {boolean} isFixed
 * @property {boolean} isFixedType
 * @property {boolean} isNullable
 */

/**
 * Map the element values
 * @param {element} e - element
 * @param {InheritedAttrs} inheritedAttrs - inherited attributes
 * @param {function} f - map function
 * @param {object=} elements - object map of elements to look for inherited types
 * @return {any}
 */
function mapValue(e, f, inheritedAttrs, elements) {
  if (e === undefined) {
    return undefined;
  }

  const attrs = {
    isFixed: inheritedAttrs.isFixed || isFixed(e),
    isFixedType: (inheritedAttrs.isFixed && isPrimitive(e)) || isFixedType(e),
    isNullable: (inheritedAttrs.isNullable && isPrimitive(e)) || isNullable(e),
  };

  if (e.content && !isEmptyArray(e, elements) && !isObjectWithUndefinedValues(e, elements)) {
    const result = f(e, attrs, elements, 'content');

    if (result !== undefined) {
      return result;
    }
  }

  const sample = getFirstSample(e);
  if (sample) {
    const result = f(sample, attrs, elements, 'sample');
    if (result !== undefined) {
      return result;
    }
  }

  const dflt = getDefault(e);
  if (dflt) {
    const result = f(dflt, attrs, elements, 'default');
    if (result !== undefined) {
      return result;
    }
  }

  // reconsider content for array and object element (prefer sample/default first)
  if (isNonEmptyArray(e, elements) && isObject(e, elements)) {
    const result = f(e, attrs, elements, 'content');

    if (result !== undefined) {
      return result;
    }
  }

  if (attrs.isNullable) {
    const result = f(new NullElement(), attrs, elements, 'nullable');
    if (result !== undefined) {
      return result;
    }
  }

  if (elements) {
    if (isRef(e)) {
      const result = elements[e.content];
      const inheritedElements = R.filter(el => !el.id.equals(e.content), elements);

      if (e.path && e.path.toValue() === 'content') {
        return mapValue(result.content, f, attrs, inheritedElements);
      }

      return mapValue(result, f, attrs, inheritedElements);
    }

    const result = elements[e.element];
    if (result !== undefined) {
      const inheritedElements = R.filter(el => !el.id.equals(e.element), elements);
      return mapValue(result, f, attrs, inheritedElements);
    }
  }

  if (isEnum(e, elements)) {
    const content = getStructureMembers(e, elements);

    if (content && content[0]) {
      const result = f(content[0], attrs, elements, 'generated');
      if (result !== undefined) {
        return result;
      }
    }
  }

  const trivial = trivialValue(e);
  if (trivial) {
    const result = f(trivial, attrs, elements, 'generated');
    if (result !== undefined) {
      return result;
    }
  }

  if ((isArray(e, elements) && e.isEmpty) || isObject(e, elements)) {
    return f(e, attrs, elements, 'generated');
  }

  return undefined;
}

/**
 * Reduce the element value
 * @param {element} e - element
 * @param {InheritedAttrs} attrs - inherited attributes
 * @param {object=} elements - object map of elements to look for inherited types
 * @return {any}
 */
function reduceValue(e, attrs, elements) {
  if (e.content === undefined) {
    return mapValue(e, e => e.content, attrs, elements);
  }

  if (isPrimitive(e, elements)) {
    return e.content;
  }

  if (e instanceof NullElement) {
    return null;
  }

  if (isEnum(e, elements)) {
    return mapValue(e.content, reduceValue, attrs, elements);
  }

  if (isObject(e, elements)) {
    let result = {};

    const content = getStructureMembers(e, elements);

    content.some((item) => {
      const isSkippable = isOptional(item) || (!(attrs.isFixed || attrs.isFixedType) && !isRequired(item));

      const key = mapValue(item.key, reduceValue, attrs, elements);
      if (key === undefined) {
        if (isSkippable) {
          return false;
        }

        result = undefined;
        return true;
      }

      const value = mapValue(item.value, reduceValue, attrs, elements);
      if (value === undefined) {
        if (isSkippable) {
          return false;
        }

        result = undefined;
        return true;
      }

      result[key] = value;
      return false;
    });

    return result;
  }

  if (isArray(e, elements)) {
    const content = getStructureMembers(e, elements);
    const result = content.map(item => mapValue(item, reduceValue, attrs, elements));

    if (!attrs.isFixed && !attrs.isFixedType) {
      return result.filter(item => item !== undefined);
    }

    if (result.includes(undefined)) {
      return undefined;
    }

    return result;
  }

  return undefined;
}

module.exports = () => {
  if (Object.getOwnPropertyNames(Element.prototype).includes('valueOf')) {
    return;
  }

  Object.defineProperty(Element.prototype, 'valueOf', {
    value(flags, elements) {
      const initialAttrs = { isFixed: false, isFixedType: false, isNullable: false };

      if (flags && flags.source) {
        return mapValue(this, (value, attrs, elements, source) => {
          const result = reduceValue(value, attrs, elements);

          if (result === undefined) {
            return undefined;
          }

          return [result, source];
        }, initialAttrs, elements);
      }

      return mapValue(this, reduceValue, initialAttrs, elements);
    },
  });
};
