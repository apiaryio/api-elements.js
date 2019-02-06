const { expect } = require('chai');
const minim = require('minim');
const apiDescription = require('../lib/api-description');

const namespace = minim.namespace().use(apiDescription);

const ArrayElement = namespace.elements.Array;
const BooleanElement = namespace.elements.Boolean;
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
