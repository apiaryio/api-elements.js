const { expect } = require('chai');
const { Fury } = require('fury');

const parseYAML = require('../../../lib/parser/parseYAML');

const { minim } = new Fury();

describe('#parseYAML', () => {
  it('fails to parse an OAS3 document with invalid YAML', () => {
    const parseResult = parseYAML('{}{}', minim);
    expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
    expect(parseResult.errors.length).to.equal(1);

    expect(parseResult).contain.error("YAML Syntax: expected '<document start>', but found {").with.sourceMap([[2,1]]);

  });

  it('can parse a string into a string element', () => {
    const element = parseYAML('hello', minim);

    expect(element).to.be.instanceof(minim.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(minim.elements.String);
    expect(element.first.toValue()).to.equal('hello');
    expect(element.first).to.have.sourceMap([[0, 5]]);
  });

  it('can parse an integer into a number element', () => {
    const element = parseYAML('1', minim);

    expect(element).to.be.instanceof(minim.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(minim.elements.Number);
    expect(element.first.toValue()).to.deep.equal(1);
    expect(element.first).to.have.sourceMap([[0, 1]]);
  });

  it('can parse an decimal into a number element', () => {
    const element = parseYAML('1.5', minim);

    expect(element).to.be.instanceof(minim.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(minim.elements.Number);
    expect(element.first.toValue()).to.deep.equal(1.5);
    expect(element.first).to.have.sourceMap([[0, 3]]);
  });

  it('can parse an boolean value into a boolean element', () => {
    const element = parseYAML('yes', minim);

    expect(element).to.be.instanceof(minim.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(minim.elements.Boolean);
    expect(element.first.toValue()).to.deep.equal(true);
    expect(element.first).to.have.sourceMap([[0, 3]]);
  });

  it('can parse null into a null element', () => {
    const element = parseYAML('null', minim);

    expect(element).to.be.instanceof(minim.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(minim.elements.Null);
    expect(element.first).to.have.sourceMap([[0, 4]]);
  });

  it('can parse an array into an array element', () => {
    const element = parseYAML('["hello"]', minim);

    expect(element).to.be.instanceof(minim.elements.ParseResult);
    expect(element.length).to.equal(1);

    const array = element.first;

    expect(array).to.be.instanceof(minim.elements.Array);
    expect(array.toValue()).to.deep.equal(['hello']);
    expect(array.sourceMapValue).to.deep.equal([[0, 9]]);

    expect(array.first).to.be.instanceof(minim.elements.String);
    expect(array.first.toValue()).to.deep.equal('hello');
    expect(array.first).to.have.sourceMap([[1, 7]]);
  });

  it('can parse a dictionary into an object element', () => {
    const element = parseYAML('key: value', minim);

    expect(element).to.be.instanceof(minim.elements.ParseResult);
    expect(element.length).to.equal(1);

    const object = element.first;

    expect(object).to.be.instanceof(minim.elements.Object);
    expect(object.toValue()).to.deep.equal({ key: 'value' });
    expect(object).to.have.sourceMap([[0, 10]]);

    const member = object.first;

    expect(member).to.be.instanceof(minim.elements.Member);

    expect(member.key).to.be.instanceof(minim.elements.String);
    expect(member.key.toValue()).to.equal('key');
    expect(member.key).to.have.sourceMap([[0, 3]]);

    expect(member.value).to.be.instanceof(minim.elements.String);
    expect(member.value.toValue()).to.equal('value');
    expect(member.value).to.have.sourceMap([[5, 5]]);
  });
});
