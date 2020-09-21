const { expect } = require('chai');
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
} = require('../lib/utils');
const { Namespace } = require('../lib/api-elements');

const namespace = new Namespace();

const { Element } = namespace;
const ArrayElement = namespace.elements.Array;
const ObjectElement = namespace.elements.Object;
const MemberElement = namespace.elements.Member;
const BooleanElement = namespace.elements.Boolean;
const EnumElement = namespace.elements.Enum;
const NullElement = namespace.elements.Null;
const NumberElement = namespace.elements.Number;
const StringElement = namespace.elements.String;

describe('isFixed', () => {
  it('returns `true` if the element typeAttributes contain `fixed`', () => {
    const element = new Element();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const value = isFixed(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element typeAttributes do not contain`fixed`', () => {
    const element = new Element();
    const value = isFixed(element);

    expect(value).to.be.false;
  });
});

describe('isFixedType', () => {
  it('returns `true` if the element typeAttributes contain `fixedType`', () => {
    const element = new Element();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixedType'),
    ]));
    const value = isFixedType(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element typeAttributes do not contain `fixedType`', () => {
    const element = new Element();
    const value = isFixedType(element);

    expect(value).to.be.false;
  });
});

describe('isRequired', () => {
  it('returns `true` if the element typeAttributes contain `required`', () => {
    const element = new Element();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('required'),
    ]));
    const value = isRequired(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element typeAttributes do not contain `required`', () => {
    const element = new Element();
    const value = isRequired(element);

    expect(value).to.be.false;
  });
});

describe('isNullable', () => {
  it('returns `true` if the element typeAttributes contain `nullable`', () => {
    const element = new Element();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = isNullable(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element typeAttributes do not contain `nullable`', () => {
    const element = new Element();
    const value = isNullable(element);

    expect(value).to.be.false;
  });
});

describe('isOptional', () => {
  it('returns `true` if the element typeAttributes contain `optional`', () => {
    const element = new Element();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('optional'),
    ]));
    const value = isOptional(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element typeAttributes do not contain `optional`', () => {
    const element = new Element();
    const value = isOptional(element);

    expect(value).to.be.false;
  });
});

describe('isPrimitive', () => {
  describe('detecting from instance type', () => {
    it('returns `true` if the element is an instance of `StringElement`', () => {
      const element = new StringElement();
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `true` if the element is an instance of `NumberElement`', () => {
      const element = new NumberElement();
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `true` if the element is an instance of `BooleanElement`', () => {
      const element = new BooleanElement();
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `true` if the element is an instance of `NullElement`', () => {
      const element = new NullElement();
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `false` if the element is an instance of `ObjectElement`', () => {
      const element = new ObjectElement();
      const value = isPrimitive(element);

      expect(value).to.be.false;
    });

    it('returns `false` if the element is an instance of `MemberElement`', () => {
      const element = new MemberElement();
      const value = isPrimitive(element);

      expect(value).to.be.false;
    });

    it('returns `false` if the element is an instance of `EnumElement`', () => {
      const element = new EnumElement();
      const value = isPrimitive(element);

      expect(value).to.be.false;
    });
  });

  describe('detecting from element type', () => {
    it('returns `true` if the property element has the value `string`', () => {
      const element = new Element();
      element.element = 'string';
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `true` if the property element has the value `number`', () => {
      const element = new Element();
      element.element = 'number';
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `true` if the property element has the value `boolean`', () => {
      const element = new Element();
      element.element = 'boolean';
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `true` if the property element has the value `null`', () => {
      const element = new Element();
      element.element = 'null';
      const value = isPrimitive(element);

      expect(value).to.be.true;
    });

    it('returns `false` if the property element has the value `object`', () => {
      const element = new Element();
      element.element = 'object';
      const value = isPrimitive(element);

      expect(value).to.be.false;
    });

    it('returns `false` if the property element has the value `member`', () => {
      const element = new Element();
      element.element = 'member';
      const value = isPrimitive(element);

      expect(value).to.be.false;
    });

    it('returns `false` if the property element has the value `enum`', () => {
      const element = new Element();
      element.element = 'enum';
      const value = isPrimitive(element);

      expect(value).to.be.false;
    });
  });

  describe('detecting element inherited type', () => {
    it('returns `true` if the inherited element type is `string`', () => {
      const element = new Element();
      element.element = 'aStringElement';
      const elements = {
        aStringElement: new StringElement(),
      };
      const value = isPrimitive(element, elements);

      expect(value).to.be.true;
    });

    it('returns `true` if the inherited element type is `number`', () => {
      const element = new Element();
      element.element = 'aNumberElement';
      const elements = {
        aNumberElement: new NumberElement(),
      };
      const value = isPrimitive(element, elements);

      expect(value).to.be.true;
    });

    it('returns `true` the inherited element type is `boolean`', () => {
      const element = new Element();
      element.element = 'aBooleanElement';
      const elements = {
        aBooleanElement: new BooleanElement(),
      };
      const value = isPrimitive(element, elements);

      expect(value).to.be.true;
    });

    it('returns `true` the inherited element type is `null`', () => {
      const element = new Element();
      element.element = 'aNullElement';
      const elements = {
        aNullElement: new NullElement(),
      };
      const value = isPrimitive(element, elements);

      expect(value).to.be.true;
    });

    it('returns `false` the inherited element type is `object`', () => {
      const element = new Element();
      element.element = 'anObjectElement';
      const elements = {
        anObjectElement: new ObjectElement(),
      };
      const value = isPrimitive(element, elements);

      expect(value).to.be.false;
    });

    it('returns `false` the inherited element type is `member`', () => {
      const element = new Element();
      element.element = 'aMemberElement';
      const elements = {
        aMemberElement: new MemberElement(),
      };
      const value = isPrimitive(element, elements);

      expect(value).to.be.false;
    });

    it('returns `false` the inherited element type is `enum`', () => {
      const element = new Element();
      element.element = 'anEnumElement';
      const elements = {
        anEnumElement: new EnumElement(),
      };
      const value = isPrimitive(element, elements);

      expect(value).to.be.false;
    });
  });
});

describe('isEnum', () => {
  it('returns `true` if the element is an instance of `EnumElement`', () => {
    const element = new EnumElement();
    const value = isEnum(element);

    expect(value).to.be.true;
  });

  it('returns `true` if the property element as the value `enum`', () => {
    const element = new Element();
    element.element = 'enum';
    const value = isEnum(element);

    expect(value).to.be.true;
  });

  it('returns `true` the inherited element type is `enum`', () => {
    const element = new Element();
    element.element = 'anEnumElement';
    const elements = {
      anEnumElement: new EnumElement(),
    };
    const value = isEnum(element, elements);

    expect(value).to.be.true;
  });

  it('returns `false` if the element is an instance of `StringElement`', () => {
    const element = new StringElement();
    const value = isEnum(element);

    expect(value).to.be.false;
  });

  it('returns `false` the inherited element type is `object`', () => {
    const element = new Element();
    element.element = 'anObjectElement';
    const elements = {
      anObjectElement: new ObjectElement(),
    };
    const value = isEnum(element, elements);

    expect(value).to.be.false;
  });
});

describe('isArray', () => {
  it('returns `true` if the element is an instance of `ArrayElement`', () => {
    const element = new ArrayElement();
    const value = isArray(element);

    expect(value).to.be.true;
  });

  it('returns `true` if the property element as the value `array`', () => {
    const element = new Element();
    element.element = 'array';
    const value = isArray(element);

    expect(value).to.be.true;
  });

  it('returns `true` the inherited element type is `array`', () => {
    const element = new Element();
    element.element = 'anArrayElement';
    const elements = {
      anArrayElement: new ArrayElement(),
    };
    const value = isArray(element, elements);

    expect(value).to.be.true;
  });

  it('returns `false` if the element is an instance of `StringElement`', () => {
    const element = new StringElement();
    const value = isArray(element);

    expect(value).to.be.false;
  });

  it('returns `false` the inherited element type is `object`', () => {
    const element = new Element();
    element.element = 'anObjectElement';
    const elements = {
      anObjectElement: new ObjectElement(),
    };
    const value = isArray(element, elements);

    expect(value).to.be.false;
  });
});

describe('isObject', () => {
  it('returns `true` if the element is an instance of `ObjectElement`', () => {
    const element = new ObjectElement();
    const value = isObject(element);

    expect(value).to.be.true;
  });

  it('returns `true` if the property element as the value `object`', () => {
    const element = new Element();
    element.element = 'object';
    const value = isObject(element);

    expect(value).to.be.true;
  });

  it('returns `true` the inherited element type is `object`', () => {
    const element = new Element();
    element.element = 'anObjectElement';
    const elements = {
      anObjectElement: new ObjectElement(),
    };
    const value = isObject(element, elements);

    expect(value).to.be.true;
  });

  it('returns `false` if the element is an instance of `StringElement`', () => {
    const element = new StringElement();
    const value = isObject(element);

    expect(value).to.be.false;
  });

  it('returns `false` the inherited element type is `array`', () => {
    const element = new Element();
    element.element = 'anArrayElement';
    const elements = {
      anArrayElement: new ArrayElement(),
    };
    const value = isObject(element, elements);

    expect(value).to.be.false;
  });
});

describe('getDefault', () => {
  it('returns the element default, when set', () => {
    const element = new Element();
    const dflt = new StringElement('default string');
    element.attributes.set('default', dflt);
    const value = getDefault(element);

    expect(value).to.equal(dflt);
  });

  it('returns `null` when no element default is set', () => {
    const element = new Element();
    const value = getDefault(element);

    expect(value).to.equal(null);
  });
});

describe('getFirstSample', () => {
  it('returns the first element sample, when set', () => {
    const element = new Element();
    const sample1 = new StringElement('first sample string');
    const sample2 = new StringElement('second sample string');
    const samples = new ArrayElement([sample1, sample2]);
    element.attributes.set('samples', samples);
    const value = getFirstSample(element);

    expect(value).to.equal(sample1);
  });

  it('returns `null` when no element sample is set', () => {
    const element = new Element();
    const value = getFirstSample(element);

    expect(value).to.equal(null);
  });
});

describe('isNonEmptyArray', () => {
  it('returns `true` if the element type is `array` and is not empty', () => {
    const element = new ArrayElement([1, 2, 3]);
    const value = isNonEmptyArray(element);

    expect(value).to.be.true;
  });

  it('returns `true` the inherited element type is `array` and is not empty', () => {
    const element = new Element([1, 2, 3]);
    element.element = 'anArrayElement';
    const elements = {
      anArrayElement: new ArrayElement([4]),
    };
    const value = isNonEmptyArray(element, elements);

    expect(value).to.be.true;
  });

  it('returns `false` if the element type is `array` and has no content', () => {
    const element = new Element();
    element.element = 'array';
    const value = isNonEmptyArray(element);

    expect(value).to.be.false;
  });

  it('returns `false` if the element type is `array` and is empty', () => {
    const element = new ArrayElement([]);
    const value = isNonEmptyArray(element);

    expect(value).to.be.false;
  });
});

describe('isEmptyArray', () => {
  it('returns `true` if the element type is `array` and is empty', () => {
    const element = new ArrayElement([]);
    const value = isEmptyArray(element);

    expect(value).to.be.true;
  });

  it('returns `true` the inherited element type is `array` and is empty', () => {
    const element = new Element([]);
    element.element = 'anArrayElement';
    const elements = {
      anArrayElement: new ArrayElement(),
    };
    const value = isEmptyArray(element, elements);

    expect(value).to.be.true;
  });

  it('returns `true` if the element type is `array` and has no content', () => {
    const element = new Element();
    element.element = 'array';
    const value = isEmptyArray(element);

    expect(value).to.be.true;
  });

  it('returns `true` if the element type is `array` and has only primitives with no value', () => {
    const element = new ArrayElement([
      new StringElement(),
      new NumberElement(),
      new BooleanElement(),
    ]);
    const value = isEmptyArray(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element type is not `array` and is empty', () => {
    const element = new ObjectElement();
    const value = isEmptyArray(element);

    expect(value).to.be.false;
  });

  it('returns `false` if the element type is `array` and has value(s)', () => {
    const element = new ArrayElement([
      new StringElement('joe'),
      new NumberElement(),
      new BooleanElement(),
    ]);
    const value = isEmptyArray(element);

    expect(value).to.be.false;
  });
});

describe('isRef', () => {
  it('returns `true` if the element type is `ref`', () => {
    const element = new Element();
    element.element = 'ref';
    const value = isRef(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element type is not `ref`', () => {
    const element = new Element();
    element.element = 'object';
    const value = isRef(element);

    expect(value).to.be.false;
  });
});

describe('isObjectWithUndefinedValues', () => {
  it('returns `true` if the element type is `object` and has no properties', () => {
    const element = new ObjectElement();
    const value = isObjectWithUndefinedValues(element);

    expect(value).to.be.true;
  });

  it('returns `true` if the element type is `object` and has no property with defined value', () => {
    const element = new ObjectElement({
      key1: new EnumElement(),
      key2: new StringElement(),
    });
    const value = isObjectWithUndefinedValues(element);

    expect(value).to.be.true;
  });

  it('returns `false` if the element type is `object` and has any property with defined value', () => {
    const element = new ObjectElement({
      key1: new EnumElement(),
      key2: new StringElement('string'),
    });
    const value = isObjectWithUndefinedValues(element);

    expect(value).to.be.false;
  });
});

describe('trivialValue', () => {
  it('returns a BooleanElement with the content `false`, when the element is an instance of `BooleanElement`', () => {
    const value = trivialValue(new BooleanElement());

    expect(value.element).to.equal('boolean');
    expect(value.content).to.equal(false);
  });

  it('returns a NumberElement with the content `0`, when the element is an instance of `NumberElement`', () => {
    const value = trivialValue(new NumberElement());

    expect(value.element).to.equal('number');
    expect(value.content).to.equal(0);
  });

  it('returns a StringElement with the content `""` (empty string), when the element is an instance of `StringElement`', () => {
    const value = trivialValue(new StringElement());

    expect(value.element).to.equal('string');
    expect(value.content).to.equal('');
  });

  it('returns a NullElement with the content `null`, when the element is a `null`', () => {
    const value = trivialValue(new NullElement());

    expect(value.element).to.equal('null');
    expect(value.content).to.equal(null);
  });
});

describe('getStructureMembers', () => {
  it('returns an array with all own members, keeping repeated primitives', () => {
    const member1 = new NumberElement(1);
    const member2 = new NumberElement(2);
    const member3 = new NumberElement(2);
    const element = new ObjectElement([member1, member2, member3]);
    const result = getStructureMembers(element);

    expect(result.length).to.equal(3);
  });

  it('returns a Map with all inherited type members and own members', () => {
    const element = new ObjectElement({ abc: 3, c: 4 });
    element.element = 'typeElement';

    const elements = {
      typeElement: new ObjectElement({ z: 10, x: 90 }),
    };

    const result = getStructureMembers(element, elements);

    expect(result.length).to.equal(4);
  });

  it('returns a Map with excuding overriden inherited type members and all own members', () => {
    const element = new ObjectElement({ abc: 3, c: 4 });
    element.element = 'typeElement';

    const elements = {
      typeElement: new ObjectElement({ abc: 10, x: 90 }),
    };

    const result = getStructureMembers(element, elements);

    expect(result.length).to.equal(3);
  });

  it('returns a Map with all ref type members and own members', () => {
    const refElement = new ObjectElement({ abc: 10, x: 90 });
    refElement.id = 'refElement';

    const element = new ObjectElement([
      new MemberElement('abc', 3),
      refElement.toRef('content'),
      new MemberElement('c', 4),
    ]);
    element.element = 'typeElement';

    const result = getStructureMembers(element, { refElement });

    expect(result.length).to.equal(3);
  });

  it('returns an empty Map, if the element is undefined', () => {
    const result = getStructureMembers(undefined);

    expect(result.length).to.equal(0);
  });
});
