const { Fury } = require('@apielements/core');
const { expect } = require('../chai');
const parseArray = require('../../../lib/parser/parseArray');

const { minim: namespace } = new Fury();
const Context = require('../../../lib/context');

describe('#parseArray', () => {
  let name;
  let context;
  let array;

  beforeEach(() => {
    name = 'Example Array';
    context = new Context(namespace);
    array = new namespace.elements.Array([
      'Doe',
      'Hello',
    ]);
  });

  it('provides warning when given element is non-array', () => {
    const element = new namespace.elements.String();

    const parseValue = value => value;
    const parseResult = parseArray(context, name, parseValue)(element);

    expect(parseResult).to.contain.warning("'Example Array' is not an array");
  });

  it('can parse an array when the transform returns an element', () => {
    const parseValue = value => value;
    const parseResult = parseArray(context, name, parseValue)(array);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get(0).toValue()).to.equal('Doe');
    expect(parseResult.get(0).get(1).toValue()).to.equal('Hello');
  });

  it('can parse an array when the transform returns a parse result', () => {
    const parseValue = value => new namespace.elements.ParseResult([value]);
    const parseResult = parseArray(context, name, parseValue)(array);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get(0).toValue()).to.equal('Doe');
    expect(parseResult.get(0).get(1).toValue()).to.equal('Hello');
  });

  it('can parse an array when the transform returns a parse result including a warning annotation', () => {
    const parseValue = (value) => {
      const warning = new namespace.elements.Annotation(
        `${value.toValue()} warning`,
        { classes: ['warning'] }
      );
      return new namespace.elements.ParseResult([value, warning]);
    };
    const parseResult = parseArray(context, name, parseValue)(array);

    expect(parseResult.length).to.equal(3);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get(0).toValue()).to.equal('Doe');
    expect(parseResult.get(0).get(1).toValue()).to.equal('Hello');

    expect(parseResult.warnings.length).to.equal(2);
    expect(parseResult.warnings.get(0).toValue()).to.equal('Doe warning');
    expect(parseResult.warnings.get(1).toValue()).to.equal('Hello warning');
  });

  it('discards any values when the transform returns a parse result which includes an error', () => {
    const parseValue = (value) => {
      const warning = new namespace.elements.Annotation(
        `${value.toValue()} error`,
        { classes: ['error'] }
      );
      return new namespace.elements.ParseResult([value, warning]);
    };
    const parseResult = parseArray(context, name, parseValue)(array);

    expect(parseResult.length).to.equal(2);
    expect(parseResult.errors.get(0).toValue()).to.equal('Doe error');
    expect(parseResult.errors.get(1).toValue()).to.equal('Hello error');
  });

  it('discards any values when the transform returns a parse result which includes a warning and no value', () => {
    const parseValue = (value) => {
      const warning = new namespace.elements.Annotation(
        `${value.toValue()} warning`,
        { classes: ['warning'] }
      );
      return new namespace.elements.ParseResult([warning]);
    };
    const parseResult = parseArray(context, name, parseValue)(array);

    expect(parseResult.length).to.equal(3);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
    expect(parseResult.get(0).isEmpty).to.be.true;

    expect(parseResult.warnings.get(0).toValue()).to.equal('Doe warning');
    expect(parseResult.warnings.get(1).toValue()).to.equal('Hello warning');
  });
});
