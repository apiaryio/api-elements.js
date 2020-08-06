const { Fury } = require('@apielements/core');
const { expect } = require('./chai');

const parse = require('../../lib/parser');
const Context = require('../../lib/context');

const { minim: namespace } = new Fury();
const { Link } = namespace.elements;

describe('#parse', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('fails to parse an OAS3 document with invalid YAML', () => {
    const source = '{}{}';

    const parseResult = parse(source, context);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult).to.contain.error("YAML Syntax: expected '<document start>', but found {");
    expect(parseResult.errors.get(0).sourceMapValue).to.deep.equal([[2, 0]]);
  });

  it('fails to parse a non-object YAML document', () => {
    const source = '[]';

    const parseResult = parse(source, context);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.error('Source document is not an object');
    expect(parseResult.errors.get(0).sourceMapValue).to.deep.equal([[0, 2]]);
  });

  it('parses a valid OAS3 document', () => {
    const source = 'openapi: "3.0.0"\ninfo: {title: My API, version: 1.0.0}\npaths: {}\n';

    const parseResult = parse(source, context);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult.length).to.equal(1);
    expect(parseResult.api.title.toValue()).to.equal('My API');
  });

  it('add the format link', () => {
    const source = 'openapi: "3.0.0"\ninfo: {title: My API, version: 1.0.0}\npaths: {}\n';
    const parseResult = parse(source, context);

    const link = parseResult.links.get(0);
    expect(link).to.be.instanceof(Link);
    expect(link.relation.toValue()).to.equal('via');
    expect(link.title.toValue()).to.equal('OpenAPI 3.0.0');
    expect(link.href.toValue()).to.equal('https://spec.openapis.org/oas/v3.0.0');
  });
});
