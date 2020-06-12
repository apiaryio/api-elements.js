const { Fury } = require('@apielements/core');
const { expect } = require('../chai');
const parseCopy = require('../../../lib/parser/parseCopy');

const { minim: namespace } = new Fury();
const Context = require('../../../lib/context');

describe('parseCopy', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('can parse a StringElement into a Copy element', () => {
    const value = new namespace.elements.String('Hello World');
    value.attributes.set('sourceMap', new namespace.elements.Array([
      new namespace.elements.SourceMap([[0, 11]]),
    ]));
    const member = new namespace.elements.Member('message', value);

    const parseResult = parseCopy(context, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    const copy = parseResult.get(0);
    expect(copy).to.be.instanceof(namespace.elements.Copy);
    expect(copy.content).to.equal('Hello World');
    expect(copy.sourceMapValue).to.deep.equal([[0, 11]]);
  });

  it('returns a warning annotation when given optional element is not a StringElement', () => {
    const value = new namespace.elements.Number(1);
    const member = new namespace.elements.Member('message', value);

    const parseResult = parseCopy(context, 'Example Object', false, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Example Object' 'message' is not a string");
  });

  it('returns a error annotation when given required element is not a StringElement', () => {
    const value = new namespace.elements.Number(1);
    const member = new namespace.elements.Member('message', value);

    const parseResult = parseCopy(context, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.error("'Example Object' 'message' is not a string");
  });
});
