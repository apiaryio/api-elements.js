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
 * Map the element values
 * @param {element} e - element
 * @param {boolean} inheritFixed - inherited fixed attribute
 * @param {function} f - map function
 * @param {object=} elements - object map of elements to look for inherited types
 * @return {any}
 */
function mapValue(e, f, inheritFixed, elements) {
  if (e === undefined) {
    return undefined;
  }

  const isElementFixed = inheritFixed || isFixed(e);

  if (e.content && !isEmptyArray(e, elements) && !isObjectWithUndefinedValues(e, elements)) {
    const result = f(e, isElementFixed, elements, 'content');

    if (result !== undefined) {
      return result;
    }
  }

  const sample = getFirstSample(e);
  if (sample) {
    const result = f(sample, isElementFixed, elements, 'sample');
    if (result !== undefined) {
      return result;
    }
  }

  const dflt = getDefault(e);
  if (dflt) {
    const result = f(dflt, isElementFixed, elements, 'default');
    if (result !== undefined) {
      return result;
    }
  }

  // reconsider content for array and object element (prefer sample/default first)
  if (isNonEmptyArray(e, elements) && isObject(e, elements)) {
    const result = f(e, isElementFixed, elements, 'content');

    if (result !== undefined) {
      return result;
    }
  }

  if (isNullable(e)) {
    const result = f(new NullElement(), isElementFixed, elements, 'nullable');
    if (result !== undefined) {
      return result;
    }
  }

  if (elements) {
    if (isRef(e)) {
      const result = elements[e.content];
      const inheritedElements = R.filter(el => !el.id.equals(e.content), elements);

      if (e.path && e.path.toValue() === 'content') {
        return mapValue(result.content, f, isElementFixed, inheritedElements);
      }

      return mapValue(result, f, isElementFixed, inheritedElements);
    }

    const result = elements[e.element];
    if (result !== undefined) {
      const inheritedElements = R.filter(el => !el.id.equals(e.element), elements);
      return mapValue(result, f, isElementFixed, inheritedElements);
    }
  }

  if (isEnum(e, elements)) {
    const content = getStructureMembers(e, elements);

    if (content && content[0]) {
      const result = f(content[0], isElementFixed, elements, 'generated');
      if (result !== undefined) {
        return result;
      }
    }
  }

  const trivial = trivialValue(e);
  if (trivial) {
    const result = f(trivial, isElementFixed, elements, 'generated');
    if (result !== undefined) {
      return result;
    }
  }

  if ((isArray(e, elements) && e.isEmpty) || isObject(e, elements)) {
    return f(e, isElementFixed, elements, 'generated');
  }

  return undefined;
}

/**
 * Reduce the element value
 * @param {element} e - element
 * @param {boolean} inheritFixed - inherited fixed attribute
 * @param {object=} elements - object map of elements to look for inherited types
 * @return {any}
 */
function reduceValue(e, inheritFixed, elements) {
  if (e.content === undefined) {
    return mapValue(e, e => e.content, inheritFixed, elements);
  }

  if (isPrimitive(e, elements)) {
    return e.content;
  }

  if (e instanceof NullElement) {
    return null;
  }

  if (isEnum(e, elements)) {
    return mapValue(e.content, reduceValue, inheritFixed, elements);
  }

  if (isObject(e, elements)) {
    let result = {};

    const content = getStructureMembers(e, elements);
    const isElementFixedType = isFixedType(e);

    content.some((item) => {
      const isSkippable = isOptional(item) || (!inheritFixed && !isElementFixedType && !isRequired(item));

      const key = mapValue(item.key, reduceValue, inheritFixed, elements);
      if (key === undefined) {
        if (isSkippable) {
          return false;
        }

        result = undefined;
        return true;
      }

      const value = mapValue(item.value, reduceValue, inheritFixed, elements);
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
    const result = content.map(item => mapValue(item, reduceValue, inheritFixed, elements));

    if (!inheritFixed && !isFixedType(e)) {
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
      if (flags && flags.source) {
        return mapValue(this, (value, attrs, elements, source) => {
          const result = reduceValue(value, attrs, elements);

          if (result === undefined) {
            return undefined;
          }

          return [result, source];
        }, false, elements);
      }

      return mapValue(this, reduceValue, false, elements);
    },
  });
};
