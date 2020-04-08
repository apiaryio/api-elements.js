const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseServerObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseServerObject', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when server is non-object', () => {
    const server = new namespace.elements.String();

    const parseResult = parse(context)(server);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Server Object' is not an object");
  });

  describe('#url', () => {
    it('warns when server object does not contain URL', () => {
      const server = new namespace.elements.Object({
      });

      const parseResult = parse(context)(server);
      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Server Object' is missing required property 'url'");
    });

    it('warns when URL is not a string', () => {
      const server = new namespace.elements.Object({
        url: 1234,
        description: 'The production API server',
      });

      const parseResult = parse(context)(server);
      expect(parseResult).to.contain.annotations;
      expect(parseResult).to.contain.error("'Server Object' 'url' is not a string");
    });

    it('parse server object with URL', () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}',
      });

      const parseResult = parse(context)(server);
      expect(parseResult).to.not.contain.annotations;
      const resource = parseResult.get(0);
      expect(resource).to.be.instanceof(namespace.elements.Resource);

      const hostClass = resource.classes.getValue(0);
      expect(hostClass).to.be.equal('host');

      const href = resource.href.toValue();
      expect(href).to.be.equal('https://{username}.gigantic-server.com/{version}');
    });
  });

  describe('#description', () => {
    it('warns when description is not a string', () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}',
        description: 1234,
      });

      const parseResult = parse(context)(server);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(parseResult).to.contain.annotations;
      expect(parseResult).to.contain.warning("'Server Object' 'description' is not a string");
    });

    it('parse server object with description', () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}',
        description: 'The production API server',
      });

      const parseResult = parse(context)(server);
      expect(parseResult).to.not.contain.annotations;
      const resource = parseResult.get(0);
      expect(resource).to.be.instanceof(namespace.elements.Resource);

      const description = resource.description.toValue();
      expect(description).to.be.equal('The production API server');
    });
  });

  describe('#variables', () => {
    it('warns when variables is not an array', () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}',
        variables: 1234,
      });

      const parseResult = parse(context)(server);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(parseResult).to.contain.annotations;
      expect(parseResult).to.contain.warning("'Server Variables Array' is not an array");
    });

    it('parse server object with variables', () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}',
        variables: [
          {
            default: 'https://user.server.com/1.0',
          },
          {
            default: 'https://user.server.com/2.0',
            description: 'The production API server',
          },
        ],
      });

      const parseResult = parse(context)(server);
      expect(parseResult).to.not.contain.annotations;
      expect(parseResult.length).to.equal(1);

      const resource = parseResult.get(0);
      expect(resource).to.be.instanceof(namespace.elements.Resource);

      const { hrefVariables } = resource;
      const secondHrefVariable = hrefVariables.content[1];

      expect(hrefVariables).to.be.instanceof(namespace.elements.Array);
      expect(hrefVariables.length).to.equal(2);

      expect(hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
      expect(secondHrefVariable).to.be.instanceof(namespace.elements.Member);
      expect(secondHrefVariable.default).to.equal('https://user.server.com/2.0');
      expect(secondHrefVariable.description.toValue()).to.equal('The production API server');
    });
  });
});
