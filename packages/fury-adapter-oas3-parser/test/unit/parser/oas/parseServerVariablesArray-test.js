const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseServerVariablesArray');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseServerVariablesArray', () => {
  let context;

  beforeEach(() => {
    context = new Context(namespace);
  });

  it('warns when it is not an array', () => {
    const servers = new namespace.elements.Object();

    const parseResult = parse(context, servers);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Server Variables Array' is not an array");
  });

  it('parses correctly when there is a single server variable', () => {
    const serverVariables = new namespace.elements.Array([
      {
        default: 'https://user.server.com/1.0',
        description: 'The production API server',
      },
    ]);

    const parseResult = parse(context, serverVariables);

    expect(parseResult.length).to.equal(1);

    const hrefVariables = parseResult.get(0);
    const hrefVariable = hrefVariables.content[0];

    expect(hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
    expect(hrefVariables.length).to.equal(1);
    expect(hrefVariable).to.be.instanceof(namespace.elements.Member);
    expect(hrefVariable.default).to.equal('https://user.server.com/1.0');
  });

  it('parses correctly when there are multiple server variables', () => {
    const serverVariables = new namespace.elements.Array([
      {
        default: 'https://user.server.com/1.0',
      },
      {
        default: 'https://user.server.com/2.0',
        description: 'The production API server',
      },
    ]);

    const parseResult = parse(context, serverVariables);

    expect(parseResult.length).to.equal(1);

    const hrefVariables = parseResult.get(0);
    const firstHrefVariable = hrefVariables.content[0];
    const secondHrefVariable = hrefVariables.content[1];

    expect(hrefVariables).to.be.instanceof(namespace.elements.Array);
    expect(hrefVariables.length).to.equal(2);

    expect(firstHrefVariable).to.be.instanceof(namespace.elements.Member);
    expect(firstHrefVariable.default).to.equal('https://user.server.com/1.0');

    expect(secondHrefVariable).to.be.instanceof(namespace.elements.Member);
    expect(secondHrefVariable.default).to.equal('https://user.server.com/2.0');
    expect(secondHrefVariable.description.toValue()).to.equal('The production API server');
  });
});
