/* eslint-disable no-bitwise, no-underscore-dangle */

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
    const attrs = e.attributes.get('typeAttributes');
    if (undefined !== attrs && undefined !== attrs.content) {
      return undefined !== attrs.content.find(attr => attr.content === attribute);
    }
  }
  return false;
}

const hasFixedTypeAttribute = e => hasTypeAttribute(e, 'fixed');
const hasFixedTypeTypeAttribute = e => hasTypeAttribute(e, 'fixedType');
const hasNullableTypeAttribute = e => hasTypeAttribute(e, 'nullable');

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

  // TODO e instanceof EnumElement fails because of dependency injection
  // checking for e.element === 'enum' as a temporary  walkaround
  const isEnumElement = e => (e.element === 'enum' || e instanceof EnumElement);
  const isPlural = e => (e instanceof ArrayElement);

  function mapValue(e, options, f) {
    const opts = updateTypeAttributes(e, options);
    var reduced;
    // TODO: working around minim not distinguishing empty Array Element from
    // Array Element with empty content
    if (e.content && (!isPlural(e) || e.content.length > 0)) {
      const result = f(e, opts, 'content');
      if (undefined !== result) {
        return result;
      }
    }
    const sample = findFirstSample(e);
    if (sample) {
      const result = f(sample, opts, 'sample');
      if (undefined !== result) {
        return result;
      }
    }
    const dflt = findDefault(e);
    if (dflt) {
      const result = f(dflt, opts, 'default');
      if (undefined !== result) {
        return result;
      }
    }
    if (isFlag(NULLABLE_FLAG, opts)) {
      const result = f(new NullElement(), opts, 'nullable');
      if (undefined !== result) {
        return result;
      }
    }
    if (isEnumElement(e)) {
      const enums = e.enumerations;
      if (enums && enums.content && enums.content[0]) {
        const result = f(enums.content[0], opts, 'generated');
        if (undefined !== result) {
          return result;
        }
      }
    }
    const trivial = trivialValue(e);
    if(trivial) {
      const result = f(trivial, opts, 'generated');
      if (undefined !== result) {
        return result;
      }
    }
    if ((e instanceof ArrayElement) && e.content.length == 0) {
      return f(e, opts, 'generated');
    }

    return undefined;
  }

  function reduceValue(e, options, src_) {
    const opts = updateTypeAttributes(e, options);
    if(undefined === e.content) {
      return mapValue(e, opts, e => e.content);
    }
    if(isPrimitive(e)) {
      return e.content;
    }
    if(e instanceof NullElement) {
      return null;
    }
    if(isEnumElement(e)) {
      return mapValue(e.content, opts, reduceValue);
    }
    if(e instanceof ArrayElement) {
      const result = e.map(item => mapValue(item, opts, reduceValue));
      if(!isFlag(FIXED_FLAG, opts) && !isFlag(FIXED_TYPE_FLAG, opts)) {
        return result.filter(item => item !== undefined);
      }
      if(result.includes(undefined)) {
        return undefined;
      }
      return result;
    }
    return undefined;
  }

  if (!Object.getOwnPropertyNames(Element.prototype).includes('valueOf')) {
    Object.defineProperty(Element.prototype, 'valueOf', {
      value(flags) {
        if (flags !== undefined && flags.source) {
          return mapValue(this, 0, (value, opts, source) => {
            const result = reduceValue(value, opts);
            if(undefined === result) {
              return undefined;
            }
            return [reduceValue(value, opts), source];
          });
        }
        return mapValue(this, 0, (value, opts, source) => {
          return reduceValue(value, opts);
        });
      },
    });
  }
};
