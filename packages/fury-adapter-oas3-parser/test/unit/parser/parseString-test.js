const { Fury } = require('fury');
const { expect } = require('../chai');
const parseString = require('../../../lib/parser/parseString');

const { minim: namespace } = new Fury();
const Context = require('../../../lib/context');

describe('parseString', () => {
  it('can parse a StringElement', () => {
    const context = new Context(namespace, { generateSourceMap: true });
    const member = new namespace.elements.Member('message', 'Hello World');

    const parseResult = parseString(context, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0).value).to.be.instanceof(namespace.elements.String);
    expect(parseResult.get(0).value.toValue()).to.equal('Hello World');
    expect(parseResult).to.not.contain.annotations;
  });

  it('returns a warning annotation when given optional element is not a StringElement', () => {
    const context = new Context(namespace, { generateSourceMap: true });
    const value = new namespace.elements.Number(1);
    const member = new namespace.elements.Member('message', value);

    const parseResult = parseString(context, 'Example Object', false, member);

    expect(parseResult).to.contain.warning("'Example Object' 'message' is not a string");
  });

  it('returns a error annotation when given required element is not a StringElement', () => {
    const context = new Context(namespace, { generateSourceMap: true });
    const value = new namespace.elements.Number(1);
    const member = new namespace.elements.Member('message', value);

    const parseResult = parseString(context, 'Example Object', true, member);

    expect(parseResult).to.contain.error("'Example Object' 'message' is not a string");
  });
});
