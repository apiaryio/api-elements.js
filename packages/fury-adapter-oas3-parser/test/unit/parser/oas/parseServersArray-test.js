const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseServersArray');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Servers Array', () => {
  let context;

  beforeEach(() => {
    context = new Context(namespace);
  });

  it('warns when it is not an array', () => {
    const servers = new namespace.elements.Object();

    const parseResult = parse(context, servers);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Servers Array' is not an array");
  });

  it('parses correctly when there is a single server', () => {
    const server = new namespace.elements.Array([
      {
        url: 'https://user.server.com/1.0',
        description: 'The production API server',
      },
    ]);

    const parseResult = parse(context, server);

    expect(parseResult.length).to.equal(1);

    const servers = parseResult.get(0);

    expect(servers).to.be.instanceof(namespace.elements.Array);
    expect(servers.length).to.equal(1);
    expect(servers.get(0)).to.be.instanceof(namespace.elements.Resource);
    expect(servers.get(0).meta.content[0].content.value.content[0].content).to.equal('host');
    expect(servers.get(0).meta.content[1].content.value.content).to.equal('The production API server');
    expect(servers.get(0).attributes.content[0].content.value.content).to.equal('https://user.server.com/1.0');
  });

  it('parses correctly when there are multiple servers', () => {
    const server = new namespace.elements.Array([
      {
        url: 'https://user.server.com/1.0',
      },
      {
        url: 'https://user.server.com/2.0',
        description: 'The production API server',
      },
    ]);

    const parseResult = parse(context, server);

    expect(parseResult.length).to.equal(1);

    const servers = parseResult.get(0);

    expect(servers).to.be.instanceof(namespace.elements.Array);
    expect(servers.length).to.equal(2);
    expect(servers.get(0)).to.be.instanceof(namespace.elements.Resource);
    expect(servers.get(0).meta.content[0].content.value.content[0].content).to.equal('host');
    expect(servers.get(0).attributes.content[0].content.value.content).to.equal('https://user.server.com/1.0');

    expect(servers.get(1)).to.be.instanceof(namespace.elements.Resource);
    expect(servers.get(1).meta.content[0].content.value.content[0].content).to.equal('host');
    expect(servers.get(1).meta.content[1].content.value.content).to.equal('The production API server');
    expect(servers.get(1).attributes.content[0].content.value.content).to.equal('https://user.server.com/2.0');
  });
});
