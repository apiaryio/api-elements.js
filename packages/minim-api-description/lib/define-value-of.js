/* eslint-disable no-bitwise, no-underscore-dangle */

const setFlag = (mask, options) => (options | mask);
const clearFlag = (mask, options) => (options & ~mask);
const isFlag = (mask, options) => (options & mask) !== 0;

const FIXED_FLAG = 1 << 0;
const NULLABLE_FLAG = 1 << 1;
const SOURCE_FLAG = 1 << 2;

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
    const attrs = e.attributes.get('typeAttributes');
    if (undefined !== attrs && undefined !== attrs.content) {
      return undefined !== attrs.content.find(attr => attr.content === attribute);
    }
  }
  return false;
}

const hasFixedTypeAttribute = e => hasTypeAttribute(e, 'fixed');
const hasNullableTypeAttribute = e => hasTypeAttribute(e, 'nullable');

function updateTypeAttributes(e, options) {
  let result = options;
  if (hasFixedTypeAttribute(e)) {
    result = setFlag(FIXED_FLAG, result);
  }
  if (hasNullableTypeAttribute(e)) {
    result = setFlag(NULLABLE_FLAG, result);
  }
  return result;
}

function wrapResult(value, source, options) {
  if (isFlag(SOURCE_FLAG, options)) {
    return [value, source];
  }
  return value;
}

module.exports = (namespace) => {
  const { Element } = namespace.elements;
  const {
    Array: ArrayElement,
    String: StringElement,
    Boolean: BooleanElement,
    Number: NumberElement,
    Null: NullElement,
    Enum: EnumElement,
  } = namespace.elements;

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

  function generateTrivialValue(e) {
    if (e instanceof BooleanElement) {
      return false;
    }
    if (e instanceof NumberElement) {
      return 0;
    }
    if (e instanceof StringElement) {
      return '';
    }
    if (e instanceof NullElement) {
      return null;
    }
    return undefined;
  }

  // TODO e instanceof EnumElement fails because of dependency injection
  // checking for e.element === 'enum' as a temporary  walkaround
  const isEnumElement = e => (e.element === 'enum' || e instanceof EnumElement);

  function valueOfAny(e, options, recurse) {
    const opts = updateTypeAttributes(e, options);
    if (e.content) {
      return wrapResult(recurse(e.content, clearFlag(SOURCE_FLAG, opts)), 'content', opts);
    }
    const sample = findFirstSample(e);
    if (sample) {
      return wrapResult(recurse(sample.content, clearFlag(SOURCE_FLAG, opts)), 'sample', opts);
    }
    const dflt = findDefault(e);
    if (dflt) {
      return wrapResult(recurse(dflt.content, clearFlag(SOURCE_FLAG, opts)), 'default', opts);
    }
    if (isFlag(NULLABLE_FLAG, opts)) {
      return wrapResult(null, 'nullable', opts);
    }
    if (isEnumElement(e)) {
      const enums = e.enumerations;
      if (enums && enums.content && enums.content[0]) {
        return wrapResult(recurse(enums.content[0], clearFlag(SOURCE_FLAG, opts)), 'generated', opts);
      }
    }

    return wrapResult(generateTrivialValue(e), 'generated', opts);
  }

  function valueOf(e, options) {
    if (isPrimitive(e) === true) {
      return valueOfAny(e, options, e => e);
    }
    if (e instanceof NullElement) {
      return valueOfAny(e, options, e => e);
    }
    if (isEnumElement(e)) {
      return valueOfAny(e, options, valueOf);
    }
    return undefined;
  }

  if (!Object.getOwnPropertyNames(Element.prototype).includes('valueOf')) {
    Object.defineProperty(Element.prototype, 'valueOf', {
      value(flags) {
        if (flags !== undefined && flags.source) {
          return valueOf(this, SOURCE_FLAG);
        }
        return valueOf(this, 0);
      },
    });
  }
};
