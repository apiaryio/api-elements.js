/* eslint-disable no-underscore-dangle */

const R = require('ramda');
const {
  Element,
  NullElement,
} = require('minim');
const {
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
} = require('./utils');

/**
 * Map the element values
 * @param {element} e - element
 * @param {function} f - map function
 * @param {object=} elements - object map of elements to look for inherited types
 * @return {any}
 */
function mapValue(e, f, elements) {
  if (e === undefined) {
    return undefined;
  }

  if (e.content && !isEmptyArray(e) && !isObjectWithUndefinedValues(e)) {
    const result = f(e, elements, 'content');

    if (result !== undefined) {
      return result;
    }
  }

  const sample = getFirstSample(e);
  if (sample) {
    const result = f(sample, elements, 'sample');
    if (result !== undefined) {
      return result;
    }
  }

  const dflt = getDefault(e);
  if (dflt) {
    const result = f(dflt, elements, 'default');
    if (result !== undefined) {
      return result;
    }
  }

  // reconsider content for array element (prefer sample/default first)
  if (isNonEmptyArray(e)) {
    const result = f(e, elements, 'content');

    if (result !== undefined) {
      return result;
    }
  }

  if (isNullable(e)) {
    const result = f(new NullElement(), elements, 'nullable');
    if (result !== undefined) {
      return result;
    }
  }

  if (elements) {
    if (isRef(e)) {
      const result = elements[e.content];
      const inheritedElements = R.filter(el => !el.id.equals(e.content), elements);

      if (e.path && e.path.toValue() === 'content') {
        return mapValue(result.content, f, inheritedElements);
      }

      return mapValue(result, f, inheritedElements);
    }

    const result = elements[e.element];
    if (result) {
      const inheritedElements = R.filter(el => !el.id.equals(e.element), elements);
      return mapValue(result, f, inheritedElements);
    }
  }

  if (isEnum(e)) {
    const enums = e.enumerations;
    if (enums && enums.content && enums.content[0]) {
      const result = f(enums.content[0], elements, 'generated');
      if (result !== undefined) {
        return result;
      }
    }
  }

  const trivial = trivialValue(e);
  if (trivial) {
    const result = f(trivial, elements, 'generated');
    if (result !== undefined) {
      return result;
    }
  }

  if (isArray(e) && e.isEmpty) {
    return f(e, elements, 'generated');
  }

  return undefined;
}

/**
 * Reduce the element value
 * @param {element} e - element
 * @param {object=} elements - object map of elements to look for inherited types
 * @return {any}
 */
function reduceValue(e, elements) {
  if (e.content === undefined) {
    return mapValue(e, e => e.content, elements);
  }

  if (isPrimitive(e)) {
    return e.content;
  }

  if (e instanceof NullElement) {
    return null;
  }

  if (isEnum(e)) {
    return mapValue(e.content, reduceValue, elements);
  }

  if (isObject(e)) {
    let result = {};

    const isFixedElement = isFixed(e);

    e.content.some((item) => {
      const isSkippable = isOptional(item) || (!isFixedElement && !isRequired(item));

      const key = mapValue(item.key, reduceValue, elements);
      if (key === undefined) {
        if (isSkippable) {
          return false;
        }

        result = undefined;
        return true;
      }

      const value = mapValue(item.value, reduceValue, elements);
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

  if (isArray(e)) {
    const result = e.map(item => mapValue(item, reduceValue, elements));

    if (!isFixed(e)) {
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
        return mapValue(this, (value, elements, source) => {
          const result = reduceValue(value, elements);
          if (result === undefined) {
            return undefined;
          }
          return [reduceValue(value, elements), source];
        }, elements);
      }
      return mapValue(this, value => reduceValue(value, elements), elements);
    },
  });
};
