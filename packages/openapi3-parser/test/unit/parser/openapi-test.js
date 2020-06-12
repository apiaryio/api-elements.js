const { Fury } = require('@apielements/core');
const { expect } = require('../chai');

const parseOpenAPI = require('../../../lib/parser/openapi');
const Context = require('../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseOpenAPI', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace, { generateSourceMap: true });
  });

  it('fails to parse an openapi version that is not a string', () => {
    const openapi = new namespace.elements.Member('openapi', 3);

    const parseResult = parseOpenAPI(context, openapi);

    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult).to.contain.error('OpenAPI version is not a string');
  });

  it('fails to parse non valid semantic version', () => {
    const openapi = new namespace.elements.Member('openapi', '3.0');

    const parseResult = parseOpenAPI(context, openapi);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult).to.contain.error("OpenAPI version does not contain valid semantic version string '3.0'");
  });

  it('fails to parse unknown major version', () => {
    const openapi = new namespace.elements.Member('openapi', '4.0.0');

    const parseResult = parseOpenAPI(context, openapi);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult).to.contain.error("Unsupported OpenAPI version '4.0.0'");
  });

  it('allows openapi 3.0.0', () => {
    const openapi = new namespace.elements.Member('openapi', '3.0.0');

    const parseResult = parseOpenAPI(context, openapi);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult).to.not.contain.annotations;
    expect(parseResult.get(0).value.toValue()).to.equal('3.0.0');
  });

  it('allows openapi patch version 3.0.11', () => {
    const openapi = new namespace.elements.Member('openapi', '3.0.11');

    const parseResult = parseOpenAPI(context, openapi);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult).to.not.contain.annotations;
    expect(parseResult.get(0).value.toValue()).to.equal('3.0.11');
  });

  it('warns for unsuported minor versions', () => {
    const openapi = new namespace.elements.Member('openapi', '3.1.0');

    const parseResult = parseOpenAPI(context, openapi);
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult).to.contain.warning("Version '3.1.0' is not fully supported");
    expect(parseResult.get(0).value.toValue()).to.equal('3.1.0');
  });
});
