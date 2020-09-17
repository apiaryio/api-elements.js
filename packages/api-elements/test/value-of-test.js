const { expect } = require('chai');
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

describe('valueOf NullElement', () => {
  it('returns null without default or samples', () => {
    const element = new NullElement();
    const value = element.valueOf();

    expect(value).to.equal(null);
  });

  it('returns null with default and samples', () => {
    const element = new NullElement();
    element.attributes.set('default', new NullElement());
    element.attributes.set('samples', new ArrayElement([
      new NullElement(),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(null);
  });

  it('returns null when nullable', () => {
    const element = new NullElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(null);
  });
});

describe('valueOf NullElement with source', () => {
  it('prefers a sample over a default', () => {
    const element = new NullElement();
    element.attributes.set('default', new NullElement());
    element.attributes.set('samples', new ArrayElement([
      new NullElement(),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'sample']);
  });

  it('prefers default over generating a value', () => {
    const element = new NullElement();
    element.attributes.set('default', new NullElement());
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'default']);
  });

  it('generates null if no default, samples and not nullable', () => {
    const element = new NullElement();
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'generated']);
  });

  it('generates null if no default, samples and nullable', () => {
    const element = new NullElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'nullable']);
  });
});

describe('valueOf BooleanElement', () => {
  it('returns content', () => {
    const element = new BooleanElement(true);
    const value = element.valueOf();

    expect(value).to.equal(true);
  });

  it('prefers content over default and samples', () => {
    const element = new BooleanElement(true);
    element.attributes.set('default', new BooleanElement(false));
    element.attributes.set('samples', new ArrayElement([
      new BooleanElement(false),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(true);
  });

  it('prefers a sample over a default', () => {
    const element = new BooleanElement();
    element.attributes.set('default', new BooleanElement(false));
    element.attributes.set('samples', new ArrayElement([
      new BooleanElement(true),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(true);
  });

  it('prefers default over generating a value', () => {
    const element = new BooleanElement();
    element.attributes.set('default', new BooleanElement(true));
    const value = element.valueOf();

    expect(value).to.equal(true);
  });

  it('generates false if no content, default, samples and not nullable', () => {
    const element = new BooleanElement();
    const value = element.valueOf();

    expect(value).to.equal(false);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new BooleanElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(null);
  });

  it('generates a boolean from RefElement', () => {
    const booleanElement = new BooleanElement(true);
    booleanElement.id = 'booleanElement';

    const element = booleanElement.toRef('element');
    const value = element.valueOf(undefined, { booleanElement });

    expect(value).to.equal(true);
  });

  it('generates a boolean from dereferenced element', () => {
    const booleanElement = new BooleanElement(true);
    booleanElement.id = 'booleanElement';

    const element = new BooleanElement();
    element.element = 'booleanElement';
    const value = element.valueOf(undefined, { booleanElement });

    expect(value).to.equal(true);
  });

  it('generates a boolean from dereferenced element recursively', () => {
    const booleanElement = new BooleanElement();
    booleanElement.element = 'booleanElement2';
    booleanElement.id = 'booleanElement';
    const booleanElement2 = new BooleanElement(true);
    booleanElement2.id = 'booleanElement2';

    const element = new BooleanElement();
    element.element = 'booleanElement';
    const value = element.valueOf(undefined, { booleanElement, booleanElement2 });

    expect(value).to.equal(true);
  });
});

describe('valueOf BooleanElement with source', () => {
  it('returns content', () => {
    const element = new BooleanElement(true);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([true, 'content']);
  });

  it('prefers content over default and samples', () => {
    const element = new BooleanElement(true);
    element.attributes.set('default', new BooleanElement(false));
    element.attributes.set('samples', new ArrayElement([
      new BooleanElement(false),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([true, 'content']);
  });

  it('prefers a sample over a default', () => {
    const element = new BooleanElement();
    element.attributes.set('default', new BooleanElement(false));
    element.attributes.set('samples', new ArrayElement([
      new BooleanElement(true),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([true, 'sample']);
  });

  it('prefers default over generating a value', () => {
    const element = new BooleanElement();
    element.attributes.set('default', new BooleanElement(true));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([true, 'default']);
  });

  it('generates false if no content, default, samples and not nullable', () => {
    const element = new BooleanElement();
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([false, 'generated']);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new BooleanElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'nullable']);
  });
});

describe('valueOf NumberElement', () => {
  it('returns content', () => {
    const element = new NumberElement(3);
    const value = element.valueOf();

    expect(value).to.equal(3);
  });

  it('prefers content over default and samples', () => {
    const element = new NumberElement(3);
    element.attributes.set('default', new NumberElement(42));
    element.attributes.set('samples', new ArrayElement([
      new NumberElement(27),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(3);
  });

  it('prefers a sample over a default', () => {
    const element = new NumberElement();
    element.attributes.set('default', new NumberElement(42));
    element.attributes.set('samples', new ArrayElement([
      new NumberElement(27),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(27);
  });

  it('prefers default over generating a value', () => {
    const element = new NumberElement();
    element.attributes.set('default', new NumberElement(42));
    const value = element.valueOf();

    expect(value).to.equal(42);
  });

  it('generates zero if no content, default, samples and not nullable', () => {
    const element = new NumberElement();
    const value = element.valueOf();

    expect(value).to.equal(0);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new NumberElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(null);
  });

  it('generates a number from RefElement', () => {
    const numberElement = new NumberElement(1);
    numberElement.id = 'numberElement';

    const element = numberElement.toRef('element');
    const value = element.valueOf(undefined, { numberElement });

    expect(value).to.equal(1);
  });

  it('generates a number from dereferenced element', () => {
    const numberElement = new NumberElement(1);
    numberElement.id = 'numberElement';

    const element = new NumberElement();
    element.element = 'numberElement';
    const value = element.valueOf(undefined, { numberElement });

    expect(value).to.equal(1);
  });

  it('generates a number from dereferenced element recursively', () => {
    const numberElement = new NumberElement();
    numberElement.element = 'numberElement2';
    numberElement.id = 'numberElement';
    const numberElement2 = new NumberElement(2);
    numberElement2.id = 'numberElement2';

    const element = new NumberElement();
    element.element = 'numberElement';
    const value = element.valueOf(undefined, { numberElement, numberElement2 });

    expect(value).to.equal(2);
  });
});

describe('valueOf NumberElement with source', () => {
  it('returns content', () => {
    const element = new NumberElement(3);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([3, 'content']);
  });

  it('prefers content over default and samples', () => {
    const element = new NumberElement(3);
    element.attributes.set('default', new NumberElement(42));
    element.attributes.set('samples', new ArrayElement([
      new NumberElement(27),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([3, 'content']);
  });

  it('prefers a sample over a default', () => {
    const element = new NumberElement();
    element.attributes.set('default', new NumberElement(42));
    element.attributes.set('samples', new ArrayElement([
      new NumberElement(27),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([27, 'sample']);
  });

  it('prefers default over generating a value', () => {
    const element = new NumberElement();
    element.attributes.set('default', new NumberElement(42));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([42, 'default']);
  });

  it('generates zero if no content, default, samples and not nullable', () => {
    const element = new NumberElement();
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([0, 'generated']);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new NumberElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'nullable']);
  });
});

describe('valueOf StringElement', () => {
  it('returns content', () => {
    const element = new StringElement('hello');
    const value = element.valueOf();

    expect(value).to.equal('hello');
  });

  it('prefers content over default and samples', () => {
    const element = new StringElement('hello');
    element.attributes.set('default', new StringElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new StringElement('zdravicko'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal('hello');
  });

  it('prefers a sample over a default', () => {
    const element = new StringElement();
    element.attributes.set('default', new StringElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new StringElement('zdravicko'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal('zdravicko');
  });

  it('prefers default over generating a value', () => {
    const element = new StringElement();
    element.attributes.set('default', new StringElement('moin'));
    const value = element.valueOf();

    expect(value).to.equal('moin');
  });

  it('generates an empty string if no content, default, samples and not nullable', () => {
    const element = new StringElement();
    const value = element.valueOf();

    expect(value).to.equal('');
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new StringElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(null);
  });

  it('generates a string from RefElement', () => {
    const stringElement = new StringElement('joe');
    stringElement.id = 'stringElement';

    const element = stringElement.toRef('element');
    const value = element.valueOf(undefined, { stringElement });

    expect(value).to.equal('joe');
  });

  it('generates a string from dereferenced element', () => {
    const stringElement = new StringElement('joe');
    stringElement.id = 'stringElement';

    const element = new StringElement();
    element.element = 'stringElement';
    const value = element.valueOf(undefined, { stringElement });

    expect(value).to.equal('joe');
  });

  it('generates a string from dereferenced element recursively', () => {
    const stringElement = new StringElement();
    stringElement.element = 'stringElement2';
    stringElement.id = 'stringElement';
    const stringElement2 = new StringElement('foe');
    stringElement2.id = 'stringElement2';

    const element = new StringElement();
    element.element = 'stringElement';
    const value = element.valueOf(undefined, { stringElement, stringElement2 });

    expect(value).to.equal('foe');
  });
});

describe('valueOf StringElement with source', () => {
  it('returns content', () => {
    const element = new StringElement('hello');
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['hello', 'content']);
  });

  it('prefers content over default and samples', () => {
    const element = new StringElement('hello');
    element.attributes.set('default', new StringElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new StringElement('zdravicko'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['hello', 'content']);
  });

  it('prefers a sample over a default', () => {
    const element = new StringElement();
    element.attributes.set('default', new StringElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new StringElement('zdravicko'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['zdravicko', 'sample']);
  });

  it('prefers default over generating a value', () => {
    const element = new StringElement();
    element.attributes.set('default', new StringElement('moin'));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['moin', 'default']);
  });

  it('generates an empty string if no content, default, samples and not nullable', () => {
    const element = new StringElement();
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['', 'generated']);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new StringElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'nullable']);
  });
});

describe('valueOf EnumElement', () => {
  it('returns content', () => {
    const element = new EnumElement(new StringElement('hello'));
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    const value = element.valueOf();

    expect(value).to.equal('hello');
  });

  it('returns content on a nested element', () => {
    const element = new EnumElement(new EnumElement(new EnumElement(new StringElement('hello'))));
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    const value = element.valueOf();

    expect(value).to.equal('hello');
  });

  it('prefers content over default and samples', () => {
    const element = new EnumElement('hello');
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('default', new EnumElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new EnumElement('zdravicko'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal('hello');
  });

  it('prefers a sample over a default', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('default', new EnumElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new EnumElement(new EnumElement('zdravicko')),
    ]));
    const value = element.valueOf();

    expect(value).to.equal('zdravicko');
  });

  it('prefers default over generating a value', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('default', new EnumElement('moin'));
    const value = element.valueOf();

    expect(value).to.equal('moin');
  });

  it('generates the first enumerations entry if no content, default, samples and not nullable', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    const value = element.valueOf();

    expect(value).to.equal(false);
  });

  it('generates undefined if no content, default, samples, enumerations and not nullable', () => {
    const element = new EnumElement();
    const value = element.valueOf();

    expect(value).to.equal(undefined);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf();

    expect(value).to.equal(null);
  });

  it('generates the first enumerations from RefElement', () => {
    const numberElement = new NumberElement(5);
    numberElement.id = 'numberElement';

    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      numberElement.toRef('content'),
      new NumberElement(3),
    ]);
    const value = element.valueOf(undefined, { numberElement });

    expect(value).to.equal(5);
  });

  it('generates the first enumerations from dereferenced element', () => {
    const enumerationElement = new EnumElement();
    enumerationElement.enumerations = new ArrayElement([1]);
    enumerationElement.id = 'enumerationElement';

    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      2,
    ]);
    element.element = 'enumerationElement';
    const value = element.valueOf(undefined, { enumerationElement });

    expect(value).to.equal(1);
  });

  it('generates the first enumerations from dereferenced element recursively', () => {
    const enumerationElement = new EnumElement();
    enumerationElement.element = 'enumerationElement2';
    enumerationElement.id = 'enumerationElement';
    const enumerationElement2 = new EnumElement(2);
    enumerationElement2.id = 'enumerationElement2';

    const element = new EnumElement();
    element.element = 'enumerationElement';
    const value = element.valueOf(undefined, { enumerationElement, enumerationElement2 });

    expect(value).to.equal(2);
  });
});

describe('valueOf EnumElement with source', () => {
  it('returns content', () => {
    const element = new EnumElement('hello');
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['hello', 'content']);
  });

  it('returns content on a nested element', () => {
    const element = new EnumElement(new EnumElement(new EnumElement(new StringElement('hello'))));
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['hello', 'content']);
  });

  it('prefers content over default and samples', () => {
    const element = new EnumElement('hello');
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('default', new EnumElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new EnumElement(new EnumElement('zdravicko')),
    ])); const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['hello', 'content']);
  });

  it('prefers a sample over a default', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('default', new EnumElement('moin'));
    element.attributes.set('samples', new ArrayElement([
      new EnumElement('zdravicko'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['zdravicko', 'sample']);
  });

  it('prefers default over generating a value', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('default', new EnumElement('moin'));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(['moin', 'default']);
  });

  it('generates the first enumerations entry if no content, default, samples and not nullable', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([false, 'generated']);
  });

  it('generates undefined if no content, default, samples, enumerations and not nullable', () => {
    const element = new EnumElement();
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(undefined);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new EnumElement();
    element.enumerations = new ArrayElement([
      new BooleanElement(),
      new NumberElement(),
      new StringElement(),
    ]);
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'nullable']);
  });
});

describe('valueOf ArrayElement', () => {
  it('returns content', () => {
    const element = new ArrayElement([1, 2, 3]);
    const value = element.valueOf();

    expect(value).to.deep.equal([1, 2, 3]);
  });

  it('returns complex content', () => {
    const innerSampled = new ArrayElement();
    innerSampled.attributes.set('samples', [[8, 3]]);
    const element = new ArrayElement([[3, innerSampled, 'test'], 2, 3]);
    const value = element.valueOf();

    expect(value).to.deep.equal([[3, [8, 3], 'test'], 2, 3]);
  });

  it('skips items without value if not fixed or fixedType', () => {
    const element = new ArrayElement([8, 4, new EnumElement(), 42]);
    const value = element.valueOf();

    expect(value).to.deep.equal([8, 4, 42]);
  });

  it('returns undefined when fixedType and with item without value', () => {
    const element = new ArrayElement([8, 4, new EnumElement(), 42]);
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixedType'),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal(undefined);
  });

  it('returns undefined when fixed and with item without value', () => {
    const element = new ArrayElement([8, 4, new EnumElement(), 42]);
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal(undefined);
  });

  it('prefers content over default and samples', () => {
    const element = new ArrayElement([1, 2, 3]);
    element.attributes.set('default', new ArrayElement([4, 2]));
    element.attributes.set('samples', new ArrayElement([
      new ArrayElement([2, 'hello']),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal([1, 2, 3]);
  });

  it('prefers a sample over a default', () => {
    const element = new ArrayElement();
    element.attributes.set('default', new ArrayElement([4, 2]));
    element.attributes.set('samples', new ArrayElement([
      new ArrayElement([2, 'hello']),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal([2, 'hello']);
  });

  it('prefers default over generating a value', () => {
    const element = new ArrayElement();
    element.attributes.set('default', new ArrayElement([4, 2]));
    const value = element.valueOf();

    expect(value).to.deep.equal([4, 2]);
  });

  it('prefers samples over empty primitive value', () => {
    const element = new ArrayElement([new NumberElement()]);
    element.attributes.set('default', new ArrayElement([4, 2]));
    element.attributes.set('samples', new ArrayElement([
      new ArrayElement([2, 'hello']),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal([2, 'hello']);
  });

  it('prefers default over empty primitive value', () => {
    const element = new ArrayElement([new NumberElement()]);
    element.attributes.set('default', new ArrayElement([4, 2]));
    const value = element.valueOf();

    expect(value).to.deep.equal([4, 2]);
  });

  it('generates [] if no content, default, samples and not nullable', () => {
    const element = new ArrayElement();
    const value = element.valueOf();

    expect(value).to.deep.equal([]);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new ArrayElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal(null);
  });

  it('inherits items from RefElement', () => {
    const numberElement = new NumberElement(3);
    numberElement.id = 'numberElement';
    const arrayElement = new ArrayElement([0]);
    arrayElement.id = 'arrayElement';

    const element = new ArrayElement([
      3, numberElement.toRef('content'), 'test', arrayElement.toRef('content'), 2, 3,
    ]);
    const value = element.valueOf(undefined, { numberElement, arrayElement });

    expect(value).to.deep.equal([3, 3, 'test', 0, 2, 3]);
  });

  it('inherits items from dereferenced elements', () => {
    const arrayElement = new ArrayElement([1, 2, 3]);
    arrayElement.id = 'arrayElement';
    const arrayElement2 = new ArrayElement([7, 8, 9]);
    arrayElement2.id = 'arrayElement2';
    const reference = new Element();
    reference.element = 'arrayElement2';

    const element = new ArrayElement([4, 5, 6, reference]);
    element.element = 'arrayElement';
    const value = element.valueOf(undefined, { arrayElement, arrayElement2 });

    expect(value).to.deep.equal([1, 2, 3, 4, 5, 6, [7, 8, 9]]);
  });

  it('inherits items from dereferenced element recursively', () => {
    const arrayElement = new ArrayElement([4, 5, 6]);
    arrayElement.element = 'arrayElement2';
    arrayElement.id = 'arrayElement';
    const arrayElement2 = new ArrayElement([1, 2, 3]);
    arrayElement2.id = 'arrayElement2';

    const element = new ArrayElement([7, 8, 9]);
    element.element = 'arrayElement';
    const value = element.valueOf(undefined, { arrayElement, arrayElement2 });

    expect(value).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe('valueOf ArrayElement with source', () => {
  it('returns content', () => {
    const element = new ArrayElement([1, 2, 3]);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([[1, 2, 3], 'content']);
  });

  it('returns complex content', () => {
    const innerSampled = new ArrayElement();
    innerSampled.attributes.set('samples', [[8, 3]]);
    const element = new ArrayElement([[3, innerSampled, 'test'], 2, 3]);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([[[3, [8, 3], 'test'], 2, 3], 'content']);
  });

  it('skips items without value if not fixed or fixedType', () => {
    const element = new ArrayElement([8, 4, new EnumElement(), 42]);
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([[8, 4, 42], 'content']);
  });

  it('returns undefined when fixedType and with item without value', () => {
    const element = new ArrayElement([8, 4, new EnumElement(), 42]);
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixedType'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(undefined);
  });

  it('returns undefined when fixed and with item without value', () => {
    const element = new ArrayElement([8, 4, new EnumElement(), 42]);
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(undefined);
  });

  it('prefers content over default and samples', () => {
    const element = new ArrayElement([1, 2, 3]);
    element.attributes.set('default', new ArrayElement([4, 2]));
    element.attributes.set('samples', new ArrayElement([
      new ArrayElement([2, 'hello']),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([[1, 2, 3], 'content']);
  });

  it('prefers a sample over a default', () => {
    const element = new ArrayElement();
    element.attributes.set('default', new ArrayElement([4, 2]));
    element.attributes.set('samples', new ArrayElement([
      new ArrayElement([2, 'hello']),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([[2, 'hello'], 'sample']);
  });

  it('prefers default over generating a value', () => {
    const element = new ArrayElement();
    element.attributes.set('default', new ArrayElement([4, 2]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([[4, 2], 'default']);
  });

  it('generates [] if no content, default, samples and not nullable', () => {
    const element = new ArrayElement();
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([[], 'generated']);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new ArrayElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'nullable']);
  });
});

describe('valueOf ObjectElement', () => {
  it('returns content', () => {
    const element = new ObjectElement({ abc: 3, c: 4 });
    const value = element.valueOf();

    expect(value).to.deep.equal({ abc: 3, c: 4 });
  });

  it('returns complex content', () => {
    const element = new ObjectElement({ abc: 3, foo: { a: 'bar', b: new EnumElement() }, c: 4 });
    const value = element.valueOf();

    expect(value).to.deep.equal({ abc: 3, foo: { a: 'bar' }, c: 4 });
  });

  it('skips properties without value if not fixed or fixedType', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    const value = element.valueOf();

    expect(value).to.deep.equal({ a: 8, b: 4, d: 42 });
  });

  it('returns undefined when fixedType and with property without value', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixedType'),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal(undefined);
  });

  it('skips property without value', () => {
    const element = new ObjectElement({ company: 'Oracle' });
    element.push(new MemberElement('name'));
    const value = element.valueOf();

    expect(value).to.deep.equal({ company: 'Oracle' });
  });

  it('returns undefined when fixed and with item without value', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal(undefined);
  });

  it('skips optional properties without key even if fixed', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const cMember = element.getMember('c');
    cMember.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('optional'),
    ]));

    const value = element.valueOf();

    expect(value).to.deep.equal({ a: 8, b: 4, d: 42 });
  });

  it('skips optional properties without key even if fixedType', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixedType'),
    ]));
    const cMember = element.getMember('c');
    cMember.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('optional'),
    ]));

    const value = element.valueOf();

    expect(value).to.deep.equal({ a: 8, b: 4, d: 42 });
  });

  it('does not skip optional properties if has value', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: 'foo', d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const cMember = element.getMember('c');
    cMember.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('optional'),
    ]));

    const value = element.valueOf();

    expect(value).to.deep.equal({
      a: 8, b: 4, c: 'foo', d: 42,
    });
  });

  it('prefers content over default and samples', () => {
    const element = new ObjectElement({ abc: 3, c: 4 });
    element.attributes.set('default', new ObjectElement({ gaga: 'bing' }));
    element.attributes.set('samples', new ArrayElement([
      new ObjectElement({ a: 3 }),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal({ abc: 3, c: 4 });
  });

  it('prefers a sample over a default', () => {
    const element = new ObjectElement();
    element.attributes.set('default', new ObjectElement({ gaga: 'bing' }));
    element.attributes.set('samples', new ArrayElement([
      new ObjectElement({ a: 3 }),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal({ a: 3 });
  });

  it('prefers default over generating a value', () => {
    const element = new ObjectElement();
    element.attributes.set('default', new ObjectElement({ gaga: 'bing' }));
    const value = element.valueOf();

    expect(value).to.deep.equal({ gaga: 'bing' });
  });

  it('prefers samples over undefined property values', () => {
    const element = new ObjectElement({ key1: new StringElement(), key2: new StringElement() });
    element.attributes.set('default', new ObjectElement({ key1: 'defaultValue', key2: 'otherDefaultValue' }));
    element.attributes.set('samples', new ArrayElement([
      new ObjectElement({ key1: 'sampleValue', key2: 'otherSampleValue' }),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal({ key1: 'sampleValue', key2: 'otherSampleValue' });
  });

  it('prefers default over undefined property values', () => {
    const defaults = new ObjectElement({ key1: 'defaultValue', key2: 'otherDefaultValue' });

    const element1 = new ObjectElement({ key1: new StringElement(), key2: new StringElement() });
    element1.attributes.set('default', defaults);
    const value1 = element1.valueOf();

    const element2 = new ObjectElement([
      new MemberElement(), new MemberElement(),
    ]);
    element2.attributes.set('default', defaults);
    const value2 = element2.valueOf();

    expect(value1).to.deep.equal({ key1: 'defaultValue', key2: 'otherDefaultValue' });
    expect(value2).to.deep.equal({ key1: 'defaultValue', key2: 'otherDefaultValue' });
  });

  it('generates {} if no content, default, samples and not nullable', () => {
    const element = new ObjectElement();
    const value = element.valueOf();

    expect(value).to.deep.equal({});
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new ObjectElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf();

    expect(value).to.deep.equal(null);
  });

  it('inherits properties from RefElement', () => {
    const objectElement = new ObjectElement({ name: 'joe' });
    objectElement.id = 'objectElement';
    const objectElement2 = new ObjectElement({ abc: 3, c: 4 });
    objectElement2.id = 'objectElement2';

    const element = new ObjectElement([
      objectElement.toRef('content'),
      new MemberElement('oneProp', 1),
      objectElement2.toRef('content'),
      new MemberElement('otherProp', 2),
    ]);
    const value = element.valueOf(undefined, { objectElement, objectElement2 });

    expect(value).to.deep.equal({
      oneProp: 1, name: 'joe', abc: 3, c: 4, otherProp: 2,
    });
  });

  it('inherits properties from dereferenced element', () => {
    const objectElement = new ObjectElement({ name: 'joe' });
    objectElement.id = 'objectElement';

    const element = new ObjectElement({ abc: 3, c: 4 });
    element.element = 'objectElement';
    const value = element.valueOf(undefined, { objectElement });

    expect(value).to.deep.equal({ name: 'joe', abc: 3, c: 4 });
  });

  it('overrides properties from dereferenced element', () => {
    const objectElement = new ObjectElement({ name: 'joe', kingdom: 'Babylon' });
    objectElement.id = 'objectElement';

    const element = new ObjectElement({ abc: 3, c: 4, name: 'bob' });
    element.element = 'objectElement';
    const value = element.valueOf(undefined, { objectElement });

    expect(value).to.deep.equal({
      kingdom: 'Babylon', abc: 3, c: 4, name: 'bob',
    });
  });

  it('inherits properties from dereferenced element recursively', () => {
    const objectElement = new ObjectElement({ name: 'joe', kingdom: 'Babylon' });
    objectElement.id = 'objectElement';
    objectElement.element = 'objectElement2';
    const objectElement2 = new ObjectElement({ abc: 3, c: 4 });
    objectElement2.id = 'objectElement2';

    const element = new ObjectElement({ oneProp: 1 });
    element.element = 'objectElement';
    const value = element.valueOf(undefined, { objectElement, objectElement2 });

    expect(value).to.deep.equal({
      abc: 3, c: 4, name: 'joe', kingdom: 'Babylon', oneProp: 1,
    });
  });
});

describe('valueOf ObjectElement with source', () => {
  it('returns content', () => {
    const element = new ObjectElement({ abc: 3, c: 4 });
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ abc: 3, c: 4 }, 'content']);
  });

  it('returns complex content', () => {
    const element = new ObjectElement({ abc: 3, foo: { a: 'bar', b: new EnumElement() }, c: 4 });
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ abc: 3, foo: { a: 'bar' }, c: 4 }, 'content']);
  });

  it('skips properties without value if not fixed or fixedType', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ a: 8, b: 4, d: 42 }, 'content']);
  });

  it('returns undefined when fixedType and with property without value', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixedType'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(undefined);
  });

  it('returns undefined when fixed and with item without value', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal(undefined);
  });

  it('skips optional properties without key even if fixed', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const cMember = element.getMember('c');
    cMember.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('optional'),
    ]));

    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ a: 8, b: 4, d: 42 }, 'content']);
  });

  it('skips optional properties without key even if fixedType', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: new EnumElement(), d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixedType'),
    ]));
    const cMember = element.getMember('c');
    cMember.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('optional'),
    ]));

    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ a: 8, b: 4, d: 42 }, 'content']);
  });

  it('does not skip optional properties if has value', () => {
    const element = new ObjectElement({
      a: 8, b: 4, c: 'foo', d: 42,
    });
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('fixed'),
    ]));
    const cMember = element.getMember('c');
    cMember.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('optional'),
    ]));

    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{
      a: 8, b: 4, c: 'foo', d: 42,
    }, 'content']);
  });

  it('prefers content over default and samples', () => {
    const element = new ObjectElement({ abc: 3, c: 4 });
    element.attributes.set('default', new ObjectElement({ gaga: 'bing' }));
    element.attributes.set('samples', new ArrayElement([
      new ObjectElement({ a: 3 }),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ abc: 3, c: 4 }, 'content']);
  });

  it('prefers a sample over a default', () => {
    const element = new ObjectElement();
    element.attributes.set('default', new ObjectElement({ gaga: 'bing' }));
    element.attributes.set('samples', new ArrayElement([
      new ObjectElement({ a: 3 }),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ a: 3 }, 'sample']);
  });

  it('prefers default over generating a value', () => {
    const element = new ObjectElement();
    element.attributes.set('default', new ObjectElement({ gaga: 'bing' }));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{ gaga: 'bing' }, 'default']);
  });

  it('generates {} if no content, default, samples and not nullable', () => {
    const element = new ObjectElement();
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([{}, 'generated']);
  });

  it('generates null if no content, default, samples and nullable', () => {
    const element = new ObjectElement();
    element.attributes.set('typeAttributes', new ArrayElement([
      new StringElement('nullable'),
    ]));
    const value = element.valueOf({ source: true });

    expect(value).to.deep.equal([null, 'nullable']);
  });
});


describe('valueOf RefElement', () => {
  it('returns value from referenced element', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const element = name.toRef('element');
    const value = element.valueOf(undefined, { name });

    expect(value).to.equal('doe');
  });

  it('returns value from referenced elements content', () => {
    const name = new StringElement('doe');
    const container = new Element(name);
    container.id = 'name';

    const element = container.toRef('content');
    const value = element.valueOf(undefined, { name: container });

    expect(value).to.equal('doe');
  });

  it('returns value from referenced element recursively', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const names = new ArrayElement([name.toRef()]);

    const value = names.valueOf(undefined, { name });

    expect(value).to.deep.equal(['doe']);
  });
});

describe('valueOf RefElement with source', () => {
  it('returns value from referenced element', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const element = name.toRef('element');
    const value = element.valueOf({ source: true }, { name });

    expect(value).to.deep.equal(['doe', 'content']);
  });

  it('returns value from referenced elements content', () => {
    const name = new StringElement('doe');
    const container = new Element(name);
    container.id = 'name';

    const element = container.toRef('content');
    const value = element.valueOf({ source: true }, { name: container });

    expect(value).to.deep.equal(['doe', 'content']);
  });

  it('returns value from referenced element recursively', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const names = new ArrayElement([name.toRef()]);

    const value = names.valueOf({ source: true }, { name });

    expect(value).to.deep.equal([['doe'], 'content']);
  });
});

describe('valueOf referenced element', () => {
  it('returns value from dereferenced element', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const element = new Element();
    element.element = 'name';

    const value = element.valueOf(undefined, { name });

    expect(value).to.equal('doe');
  });
});

describe('valueOf referenced element with source', () => {
  it('returns value from dereferenced element', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const element = new Element();
    element.element = 'name';

    const value = element.valueOf({ source: true }, { name });

    expect(value).to.deep.equal(['doe', 'content']);
  });
});
