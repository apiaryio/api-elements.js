const { expect } = require('chai');
const { Fury } = require('fury');

const parse = require('../../lib/parser');

const { minim } = new Fury();

describe('#parse', () => {
  it('fails to parse an OAS3 document with invalid YAML', () => {
    const source = '{}{}';

    const parseResult = parse(source, minim);
    expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
    expect(parseResult.errors.length).to.equal(1);
    expect(parseResult.errors.getValue(0)).to.equal("YAML Syntax: expected '<document start>', but found {");
    expect(parseResult.errors.get(0).sourceMapValue).to.deep.equal([[2, 1]]);
  });

  it('fails to parse a non-object YAML document', () => {
    const source = '[]';

    const parseResult = parse(source, minim);
    expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
    expect(parseResult.length).to.equal(1);
    expect(parseResult.errors.get(0).toValue()).to.equal('Source document is not an object');
    expect(parseResult.errors.get(0).sourceMapValue).to.deep.equal([[0, 2]]);
  });

  it('parses a valid OAS3 document', () => {
    const source = 'openapi: "3.0.0"\ninfo: {title: My API, version: 1.0.0}\npaths: {}\n';

    const parseResult = parse(source, minim);
    expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
    expect(parseResult.length).to.equal(1);
    expect(parseResult.api.title.toValue()).to.equal('My API');
  });
});
