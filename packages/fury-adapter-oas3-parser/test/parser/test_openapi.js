const { expect } = require('chai');
const { Fury } = require('fury');

const parseOpenAPI = require('../../lib/parser/openapi');

const minim = new Fury().minim;

describe('#parseOpenAPI', function () {
  it('fails to parse an openapi version that is not a string', function () {
    const openapi = new minim.elements.Member('openapi', 3);

    const parseResult = parseOpenAPI(minim, openapi);
    expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
    expect(parseResult.errors.length).to.equal(1);
    expect(parseResult.errors.getValue(0)).to.equal('OpenAPI version is not a string');
  });

  it('fails to parse unknown version', function () {
    const openapi = new minim.elements.Member('openapi', '4.0.0');

    const parseResult = parseOpenAPI(minim, openapi);
    expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
    expect(parseResult.errors.length).to.equal(1);
    expect(parseResult.errors.getValue(0)).to.equal("Unsupported OpenAPI version '4.0.0'");
  });

  it('allows openapi 3.0.0', function () {
    const openapi = new minim.elements.Member('openapi', '3.0.0');

    const parseResult = parseOpenAPI(minim, openapi);
    expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
    expect(parseResult.isEmpty).to.be.true;
  });
});
