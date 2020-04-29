const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseSecurityRequirementsArray');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Security Requirements Array', () => {
  let context;

  beforeEach(() => {
    context = new Context(namespace);
    context.registerScheme('apiKey');
    context.registerScheme('custom1');
    context.registerScheme('custom2');
  });

  it('warns when it is not an array', () => {
    const securityRequirements = new namespace.elements.String();

    const parseResult = parse(context, securityRequirements);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Security Requirements Array' is not an array");
  });

  it('parses correctly when there is a single security requirement', () => {
    const securityRequirements = new namespace.elements.Array([
      {
        apiKey: [],
      },
    ]);

    const parseResult = parse(context, securityRequirements);

    expect(parseResult.length).to.equal(1);

    const authSchemes = parseResult.get(0);

    expect(authSchemes).to.be.instanceof(namespace.elements.Array);
    expect(authSchemes.length).to.equal(1);
    expect(authSchemes.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
    expect(authSchemes.get(0).element).to.equal('apiKey');
  });

  it('parses correctly when there are multiple security requirements', () => {
    const securityRequirements = new namespace.elements.Array([
      {
        apiKey: [],
      },
      {
        custom1: [],
        custom2: [],
      },
    ]);

    const parseResult = parse(context, securityRequirements);

    expect(parseResult.length).to.equal(1);

    const authSchemes = parseResult.get(0);

    expect(authSchemes).to.be.instanceof(namespace.elements.Array);
    expect(authSchemes.length).to.equal(2);
    expect(authSchemes.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
    expect(authSchemes.get(0).element).to.equal('apiKey');
    expect(authSchemes.get(1)).to.be.instanceof(namespace.elements.Extension);
    expect(authSchemes.get(1).content.length).to.equal(2);
    // TODO: Remove content[n] and use get(n) when moved to allOf element
    expect(authSchemes.get(1).content[0]).to.be.instanceof(namespace.elements.AuthScheme);
    expect(authSchemes.get(1).content[0].element).to.equal('custom1');
    expect(authSchemes.get(1).content[1]).to.be.instanceof(namespace.elements.AuthScheme);
    expect(authSchemes.get(1).content[1].element).to.equal('custom2');
  });
});
