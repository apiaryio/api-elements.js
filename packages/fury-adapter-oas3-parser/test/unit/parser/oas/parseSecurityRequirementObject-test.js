const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseSecurityRequirementObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Security Requirement Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when security requirement is not an object', () => {
    const securityRequirement = new namespace.elements.String();

    const parseResult = parse(context, securityRequirement);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Security Requirement Object' is not an object");
  });

  it('provides warning when values in security requirement is not an array', () => {
    const securityRequirement = new namespace.elements.Object({
      customApiKey: 1,
    });

    const parseResult = parse(context, securityRequirement);

    expect(parseResult.length).to.equal(2);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
    expect(parseResult.get(0).length).to.equal(0);

    expect(parseResult).to.contain.warning("'Security Requirement Object' 'customApiKey' is not an array");
  });

  it('parses correctly a single scheme reference without scopes', () => {
    const securityRequirement = new namespace.elements.Object({
      customApiKey: [],
    });

    const parseResult = parse(context, securityRequirement);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);

    const arr = parseResult.get(0);

    expect(arr.length).to.equal(1);
    expect(arr.get(0).element).to.equal('customApiKey');
    expect(arr.get(0).length).to.equal(0);
  });

  it('parses correctly a single scheme reference with scopes', () => {
    const securityRequirement = new namespace.elements.Object({
      customOauth2: [
        'scope1',
        'scope2',
      ],
    });

    const parseResult = parse(context, securityRequirement);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);

    const arr = parseResult.get(0);

    expect(arr.length).to.equal(1);
    expect(arr.get(0).element).to.equal('customOauth2');
    expect(arr.get(0).length).to.equal(1);

    const scopes = arr.get(0).get('scopes');

    expect(scopes).to.be.instanceof(namespace.elements.Array);
    expect(scopes.length).to.equal(2);
    expect(scopes.get(0).toValue()).to.equal('scope1');
    expect(scopes.get(1).toValue()).to.equal('scope2');
  });

  it('provides warning when scope is not a string', () => {
    const securityRequirement = new namespace.elements.Object({
      customOauth2: [
        'scope1',
        2,
      ],
    });

    const parseResult = parse(context, securityRequirement);

    expect(parseResult.length).to.equal(2);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);

    const arr = parseResult.get(0);

    expect(arr.length).to.equal(1);
    expect(arr.get(0).element).to.equal('customOauth2');
    expect(arr.get(0).length).to.equal(1);

    const scopes = arr.get(0).get('scopes');

    expect(scopes).to.be.instanceof(namespace.elements.Array);
    expect(scopes.length).to.equal(1);
    expect(scopes.get(0).toValue()).to.equal('scope1');

    expect(parseResult).to.contain.warning("'Security Requirement Object' 'customOauth2' array value is not a string");
  });

  it('parses correctly multi scheme references', () => {
    const securityRequirement = new namespace.elements.Object({
      customApiKey: [],
      customOauth2: [],
    });

    const parseResult = parse(context, securityRequirement);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);

    const arr = parseResult.get(0);

    expect(arr.length).to.equal(2);
    expect(arr.get(0).element).to.equal('customApiKey');
    expect(arr.get(0).length).to.equal(0);
    expect(arr.get(1).element).to.equal('customOauth2');
    expect(arr.get(1).length).to.equal(0);
  });
});
