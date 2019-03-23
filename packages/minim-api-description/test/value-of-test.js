const { expect } = require('chai');
const minim = require('minim');
const apiDescription = require('../lib/api-description');

const namespace = minim.namespace().use(apiDescription);

const { Element } = namespace;
const ArrayElement = namespace.elements.Array;
const ObjectElement = namespace.elements.Object;
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
    element.attributes.set('samples', new ArrayElement(
      new NullElement()
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new BooleanElement(false)
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new BooleanElement(false)
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new NumberElement(27)
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new NumberElement(27)
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new StringElement('zdravicko')
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new StringElement('zdravicko')
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new EnumElement('zdravicko')
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new EnumElement(new EnumElement('zdravicko'))
    )); const value = element.valueOf({ source: true });

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
    element.attributes.set('samples', new ArrayElement(
      new ArrayElement([2, 'hello'])
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new ArrayElement([2, 'hello'])
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new ObjectElement({ a: 3 })
    ));
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
    element.attributes.set('samples', new ArrayElement(
      new ObjectElement({ a: 3 })
    ));
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
    const value = element.valueOf(undefined, [name]);

    expect(value).to.equal('doe');
  });

  it('returns value from referenced elements content', () => {
    const name = new StringElement('doe');
    const container = new Element(name);
    container.id = 'name';

    const element = container.toRef('content');
    const value = element.valueOf(undefined, [container]);

    expect(value).to.equal('doe');
  });

  it('returns value from referenced element recursively', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const names = new ArrayElement([name.toRef()]);

    const value = names.valueOf(undefined, [name]);

    expect(value).to.deep.equal(['doe']);
  });
});

describe('valueOf RefElement with source', () => {
  it('returns value from referenced element', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const element = name.toRef('element');
    const value = element.valueOf({ source: true }, [name]);

    expect(value).to.deep.equal(['doe', 'content']);
  });

  it('returns value from referenced elements content', () => {
    const name = new StringElement('doe');
    const container = new Element(name);
    container.id = 'name';

    const element = container.toRef('content');
    const value = element.valueOf({ source: true }, [container]);

    expect(value).to.deep.equal(['doe', 'content']);
  });

  it('returns value from referenced element recursively', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const names = new ArrayElement([name.toRef()]);

    const value = names.valueOf({ source: true }, [name]);

    expect(value).to.deep.equal([['doe'], 'content']);
  });
});

describe('valueOf referenced element', () => {
  it('returns value from dereferenced element', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const element = new Element();
    element.element = 'name';

    const value = element.valueOf(undefined, [name]);

    expect(value).to.equal('doe');
  });
});

describe('valueOf referenced element with source', () => {
  it('returns value from dereferenced element', () => {
    const name = new StringElement('doe');
    name.id = 'name';

    const element = new Element();
    element.element = 'name';

    const value = element.valueOf({ source: true }, [name]);

    expect(value).to.deep.equal(['doe', 'content']);
  });
});
