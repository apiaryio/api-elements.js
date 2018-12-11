const { expect } = require('chai');
const { Fury } = require('fury');
const parseCopy = require('../../../lib/parser/parseCopy');

const { minim } = new Fury();

describe('parseCopy', () => {
  it('can parse a StringElement into a Copy element', () => {
    const value = new minim.elements.String('Hello World');
    value.attributes.set('sourceMap', new minim.elements.Array([
      new minim.elements.SourceMap([[0, 11]]),
    ]));
    const member = new minim.elements.Member('message', value);

    const parseResult = parseCopy(minim, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    const copy = parseResult.get(0);
    expect(copy).to.be.instanceof(minim.elements.Copy);
    expect(copy.content).to.equal('Hello World');
    expect(copy.sourceMapValue).to.deep.equal([[0, 11]]);
  });

  it('returns a warning annotation when given optional element is not a StringElement', () => {
    const value = new minim.elements.Number(1);
    const member = new minim.elements.Member('message', value);

    const parseResult = parseCopy(minim, 'Example Object', false, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Example Object' 'message' is not a string");
  });

  it('returns a error annotation when given required element is not a StringElement', () => {
    const value = new minim.elements.Number(1);
    const member = new minim.elements.Member('message', value);

    const parseResult = parseCopy(minim, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.error("'Example Object' 'message' is not a string");
  });
});
