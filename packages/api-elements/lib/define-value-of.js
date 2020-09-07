/* eslint-disable no-bitwise, no-underscore-dangle */

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

const setFlag = (mask, options) => (options | mask);
const clearFlag = (mask, options) => (options & ~mask);
const isFlag = (mask, options) => (options & mask) !== 0;

const FIXED_FLAG = 1 << 0;
const NULLABLE_FLAG = 1 << 1;
const FIXED_TYPE_FLAG = 1 << 2;

function findDefault(e) {
  if (undefined !== e._attributes) {
    const result = e.attributes.get('default');
    if (undefined !== result) {
      return result;
    }
  }
  return null;
}

function hasTypeAttribute(e, attribute) {
  if (undefined !== e._attributes) {
    const typeAttributes = e.attributes.get('typeAttributes');
    if (typeAttributes) {
      return typeAttributes.includes(attribute);
    }
  }

  return false;
}

const hasFixedTypeAttribute = e => hasTypeAttribute(e, 'fixed');
const hasFixedTypeTypeAttribute = e => hasTypeAttribute(e, 'fixedType');
const hasNullableTypeAttribute = e => hasTypeAttribute(e, 'nullable');
const hasOptionalTypeAttribute = e => hasTypeAttribute(e, 'optional');

function updateTypeAttributes(e, options) {
  let result = options;

  if (hasFixedTypeAttribute(e)) {
    result = setFlag(FIXED_FLAG, result);
  }

  if (hasFixedTypeTypeAttribute(e)) {
    result = setFlag(FIXED_TYPE_FLAG, result);
  }

  if (hasNullableTypeAttribute(e)) {
    result = setFlag(NULLABLE_FLAG, result);
  }

  return result;
}

function inheritFlags(options) {
  return clearFlag(clearFlag(FIXED_TYPE_FLAG | NULLABLE_FLAG, options));
}

function findFirstSample(e) {
  if (undefined !== e._attributes) {
    const samples = e.attributes.get('samples');
    if (samples instanceof ArrayElement) {
      if (undefined !== samples.content && samples.content.length > 0) {
        return samples.content[0];
      }
    }
  }

  return null;
}

const isPrimitive = e => (e instanceof StringElement) || (e instanceof NumberElement) || (e instanceof BooleanElement);
const isEnumElement = e => e instanceof EnumElement;
const isArrayElement = e => e instanceof ArrayElement;
const isObjectElement = e => e instanceof ObjectElement;

const hasSample = e => findFirstSample(e) !== null;
const hasDefault = e => findDefault(e) !== null;
const hasContent = e => e.content !== undefined;
const hasValue = R.anyPass([hasContent, hasSample, hasDefault]);
const hasNoValue = R.complement(hasValue);
const isNoValuePrimitive = R.both(isPrimitive, hasNoValue);
const isNonEmptyArrayElement = e => isArrayElement(e) && e.content && !e.isEmpty;
const isEmptyArray = e => isArrayElement(e) && e.content.every(isNoValuePrimitive);
const isObjectWithUndefinedValues = e => isObjectElement(e) && e.content.every(prop => prop.value.content === undefined);


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

function mapValue(e, options, f, elements) {
  if (e === undefined) {
    return e;
  }

  const opts = updateTypeAttributes(e, options);

  if (e.content && !isEmptyArray(e) && !isObjectWithUndefinedValues(e)) {
    const result = f(e, opts, elements, 'content');

    if (undefined !== result) {
      return result;
    }
  }

  const sample = findFirstSample(e);
  if (sample) {
    const result = f(sample, opts, elements, 'sample');
    if (undefined !== result) {
      return result;
    }
  }

  const dflt = findDefault(e);
  if (dflt) {
    const result = f(dflt, opts, elements, 'default');
    if (undefined !== result) {
      return result;
    }
  }

  // reconsider content for array element (prefer sample/default first)
  if (isNonEmptyArrayElement(e)) {
    const result = f(e, opts, elements, 'content');

    if (undefined !== result) {
      return result;
    }
  }

  if (isFlag(NULLABLE_FLAG, opts)) {
    const result = f(new NullElement(), opts, elements, 'nullable');
    if (undefined !== result) {
      return result;
    }
  }

  if (elements) {
    if (e.element === 'ref') {
      const result = elements[e.content];
      const inheritedElements = R.filter(el => !el.id.equals(e.content), elements);

      if (e.path && e.path.toValue() === 'content') {
        return mapValue(result.content, opts, f, inheritedElements);
      }

      return mapValue(result, opts, f, inheritedElements);
    }

    const result = elements[e.element];
    if (result) {
      const inheritedElements = R.filter(el => !el.id.equals(e.element), elements);
      return mapValue(result, opts, f, inheritedElements);
    }
  }

  if (isEnumElement(e)) {
    const enums = e.enumerations;
    if (enums && enums.content && enums.content[0]) {
      const result = f(enums.content[0], opts, elements, 'generated');
      if (undefined !== result) {
        return result;
      }
    }
  }

  const trivial = trivialValue(e);
  if (trivial) {
    const result = f(trivial, opts, elements, 'generated');
    if (undefined !== result) {
      return result;
    }
  }

  if (isArrayElement(e) && e.isEmpty) {
    return f(e, opts, elements, 'generated');
  }

  return undefined;
}

function reduceValue(e, options, elements) {
  const opts = updateTypeAttributes(e, options);

  if (e.content === undefined) {
    return mapValue(e, opts, e => e.content, elements);
  }

  if (isPrimitive(e)) {
    return e.content;
  }

  if (e instanceof NullElement) {
    return null;
  }

  if (isEnumElement(e)) {
    return mapValue(e.content, inheritFlags(opts), reduceValue, elements);
  }

  if (isObjectElement(e)) {
    let result = {};

    const isFixed = isFlag(FIXED_FLAG, opts);
    const isFixedType = isFlag(FIXED_TYPE_FLAG, opts);

    e.content.some((item) => {
      const skippable = hasOptionalTypeAttribute(item) || (!isFixed && !isFixedType && !hasTypeAttribute(item, 'required'));

      const key = mapValue(item.key, inheritFlags(opts), reduceValue, elements);
      if (key === undefined) {
        if (skippable) {
          return false;
        }

        result = undefined;
        return true;
      }

      const value = mapValue(item.value, inheritFlags(opts), reduceValue, elements);
      if (value === undefined) {
        if (skippable) {
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

  if (e instanceof ArrayElement) {
    const result = e.map(item => mapValue(item, inheritFlags(opts), reduceValue, elements));

    if (!isFlag(FIXED_FLAG, opts) && !isFlag(FIXED_TYPE_FLAG, opts)) {
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
  if (!Object.getOwnPropertyNames(Element.prototype).includes('valueOf')) {
    Object.defineProperty(Element.prototype, 'valueOf', {
      value(flags, elements) {
        if (flags !== undefined && flags.source) {
          return mapValue(this, 0, (value, opts, elements, source) => {
            const result = reduceValue(value, opts, elements);
            if (undefined === result) {
              return undefined;
            }
            return [reduceValue(value, opts, elements), source];
          }, elements);
        }
        return mapValue(this, 0, (value, opts) => reduceValue(value, opts, elements), elements);
      },
    });
  }
};
