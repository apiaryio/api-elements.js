const { Fury } = require('@apielements/core');
const { expect } = require('../chai');
const parseBoolean = require('../../../lib/parser/parseBoolean');

const { minim: namespace } = new Fury();
const Context = require('../../../lib/context');

describe('parseBoolean', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('can parse a BooleanElement with `true` value', () => {
    const member = new namespace.elements.Member('required', true);

    const parseResult = parseBoolean(context, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0).value).to.be.instanceof(namespace.elements.Boolean);
    expect(parseResult.get(0).value.toValue()).to.equal(true);
  });

  it('can parse a BooleanElement with `false` value', () => {
    const member = new namespace.elements.Member('required', false);

    const parseResult = parseBoolean(context, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0).value).to.be.instanceof(namespace.elements.Boolean);
    expect(parseResult.get(0).value.toValue()).to.equal(false);
  });

  it('returns a warning annotation when given optional element is not a BooleanElement', () => {
    const value = new namespace.elements.Number(1);
    const member = new namespace.elements.Member('required', value);

    const parseResult = parseBoolean(context, 'Example Object', false, member);

    expect(parseResult.length).to.equal(1);
    const warning = parseResult.warnings.get(0);
    expect(warning).to.be.instanceof(namespace.elements.Annotation);
    expect(warning.toValue()).to.equal(
      "'Example Object' 'required' is not a boolean"
    );
  });

  it('returns a error annotation when given required element is not a BooleanElement', () => {
    const value = new namespace.elements.Number(1);
    const member = new namespace.elements.Member('required', value);

    const parseResult = parseBoolean(context, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    const error = parseResult.errors.get(0);
    expect(error).to.be.instanceof(namespace.elements.Annotation);
    expect(error.toValue()).to.equal(
      "'Example Object' 'required' is not a boolean"
    );
  });
});
