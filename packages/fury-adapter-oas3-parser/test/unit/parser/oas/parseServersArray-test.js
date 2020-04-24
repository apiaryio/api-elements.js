const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseServersArray');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseServersArray', () => {
  let context;

  beforeEach(() => {
    context = new Context(namespace);
  });

  it('warns when it is not an array', () => {
    const servers = new namespace.elements.Object();

    const name = 'parent-name';
    const parseResult = parse(context, name, servers);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'parent-name' 'servers' is not an array");
  });

  it('parses correctly when there is a single server', () => {
    const servers = new namespace.elements.Array([
      {
        url: 'https://user.server.com/1.0',
        description: 'The production API server',
      },
    ]);

    const name = 'parent-name';
    const parseResult = parse(context, name, servers);

    expect(parseResult.length).to.equal(1);

    const hosts = parseResult.get(0);
    const host = hosts.get(0);

    expect(hosts).to.be.instanceof(namespace.elements.Array);
    expect(hosts.length).to.equal(1);
    expect(host).to.be.instanceof(namespace.elements.Resource);
    expect(host.classes.toValue()).to.deep.equal(['host']);
    expect(host.description.toValue()).to.equal('The production API server');
    expect(host.href.toValue()).to.equal('https://user.server.com/1.0');
  });

  it('parses correctly when there are multiple servers', () => {
    const servers = new namespace.elements.Array([
      {
        url: 'https://user.server.com/1.0',
      },
      {
        url: 'https://user.server.com/2.0',
        description: 'The production API server',
      },
    ]);

    const name = 'parent-name';
    const parseResult = parse(context, name, servers);

    expect(parseResult.length).to.equal(1);

    const hosts = parseResult.get(0);
    const firstHost = hosts.get(0);
    const secondHost = hosts.get(1);

    expect(hosts).to.be.instanceof(namespace.elements.Array);
    expect(hosts.length).to.equal(2);
    expect(firstHost).to.be.instanceof(namespace.elements.Resource);
    expect(firstHost.classes.toValue()).to.deep.equal(['host']);
    expect(firstHost.href.toValue()).to.equal('https://user.server.com/1.0');

    expect(secondHost).to.be.instanceof(namespace.elements.Resource);
    expect(secondHost.classes.toValue()).to.deep.equal(['host']);
    expect(secondHost.description.toValue()).to.equal('The production API server');
    expect(secondHost.href.toValue()).to.equal('https://user.server.com/2.0');
  });
});
