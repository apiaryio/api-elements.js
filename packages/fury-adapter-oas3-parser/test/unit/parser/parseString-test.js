const { expect } = require('chai');
const { Fury } = require('fury');
const parseString = require('../../../lib/parser/parseString');

const { minim } = new Fury();

describe('parseString', () => {
  it('can parse a StringElement', () => {
    const member = new minim.elements.Member('message', 'Hello World');

    const parseResult = parseString(minim, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0).value).to.be.instanceof(minim.elements.String);
    expect(parseResult.get(0).value.toValue()).to.equal('Hello World');
  });

  it('returns a warning annotation when given optional element is not a StringElement', () => {
    const value = new minim.elements.Number(1);
    const member = new minim.elements.Member('message', value);

    const parseResult = parseString(minim, 'Example Object', false, member);

    expect(parseResult.length).to.equal(1);
    const warning = parseResult.warnings.get(0);
    expect(warning).to.be.instanceof(minim.elements.Annotation);
    expect(warning.toValue()).to.equal(
      "'Example Object' 'message' is not a string"
    );
  });

  it('returns a error annotation when given required element is not a StringElement', () => {
    const value = new minim.elements.Number(1);
    const member = new minim.elements.Member('message', value);

    const parseResult = parseString(minim, 'Example Object', true, member);

    expect(parseResult.length).to.equal(1);
    const error = parseResult.errors.get(0);
    expect(error).to.be.instanceof(minim.elements.Annotation);
    expect(error.toValue()).to.equal(
      "'Example Object' 'message' is not a string"
    );
  });
});
