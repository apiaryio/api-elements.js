/* eslint-disable no-underscore-dangle */

const R = require('ramda');
const {
  Element,
  ArrayElement,
  ObjectElement,
  StringElement,
  BooleanElement,
  NumberElement,
  NullElement,
} = require('minim');

const EnumElement = require('./elements/Enum');

function hasTypeAttribute(e, attribute) {
  const typeAttributes = e._attributes && e.attributes.get('typeAttributes');
  if (typeAttributes) {
    return typeAttributes.includes(attribute);
  }

  return false;
}

const isFixed = e => hasTypeAttribute(e, 'fixed') || hasTypeAttribute(e, 'fixedType');
const isRequired = e => hasTypeAttribute(e, 'required');
const isNullable = e => hasTypeAttribute(e, 'nullable');
const isOptional = e => hasTypeAttribute(e, 'optional');
const isPrimitive = e => (e instanceof StringElement) || (e instanceof NumberElement) || (e instanceof BooleanElement);
const isEnum = e => e instanceof EnumElement;
const isArray = e => e instanceof ArrayElement;
const isObject = e => e instanceof ObjectElement;

function getDefault(e) {
  const result = e._attributes && e.attributes.get('default');
  if (result !== undefined) {
    return result;
  }

  return null;
}

function getFirstSample(e) {
  const samples = e._attributes && e.attributes.get('samples');
  if (isArray(samples) && samples.content && !samples.isEmpty) {
    return samples.content[0];
  }

  return null;
}

const hasSample = e => getFirstSample(e) !== null;
const hasDefault = e => getDefault(e) !== null;
const hasContent = e => e.content !== undefined;
const hasValue = R.anyPass([hasContent, hasSample, hasDefault]);
const hasNoValue = R.complement(hasValue);
const isNoValuePrimitive = R.both(isPrimitive, hasNoValue);
const isNonEmptyArray = e => isArray(e) && e.content && !e.isEmpty;
const isEmptyArray = e => isArray(e) && e.content.every(isNoValuePrimitive);
const isRef = e => e && e.element === 'ref';
const isObjectWithUndefinedValues = e => isObject(e)
  && e.content.every(prop => prop.value === undefined || prop.value.content === undefined);

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
