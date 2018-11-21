const { expect } = require('chai');
const R = require('ramda');
const { Fury } = require('fury');
const parseCopy = require('../../lib/parser/parseCopy');

const { minim } = new Fury();

describe('parseCopy', () => {
  it('can parse a StringElement into a Copy element', () => {
    const value = new minim.elements.String('Hello World');
    value.attributes.set('sourceMap', new minim.elements.Array([
      new minim.elements.SourceMap([[0, 11]]),
    ]));

    const member = new minim.elements.Member('message', value);

    const copy = parseCopy(minim, R.T, member);

    expect(copy).to.be.instanceof(minim.elements.Copy);
    expect(copy.content).to.equal('Hello World');
    expect(copy.sourceMapValue).to.deep.equal([[0, 11]]);
  });

  it('returns an annotation when given element is not a StringElement', () => {
    const value = new minim.elements.Number(1);
    const member = new minim.elements.Member('message', value);

    const createAnnotation = (member) => {
      const message = `${member.value.toValue()} is not a string`;
      return new minim.elements.Annotation(message);
    };

    const copy = parseCopy(minim, createAnnotation, member);

    expect(copy).to.be.instanceof(minim.elements.Annotation);
    expect(copy.toValue()).to.equal('1 is not a string');
  });
});
