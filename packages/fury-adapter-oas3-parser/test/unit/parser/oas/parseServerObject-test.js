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
    it('warns when variables is not an object', () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}',
        variables: 1234,
      });

      const parseResult = parse(context)(server);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(parseResult).to.contain.annotations;
      expect(parseResult).to.contain.warning("'Server Object' 'variables' is not an object");
    });

    it("warns when a variable in server 'variables' is not defined in the URL and removes it", () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}/',
        variables: {
          username: {
            default: 'Mario',
            description: 'API user name',
          },
          version: {
            default: '1.0',
          },
          location: {
            default: 'Prague',
          },
        },
      });

      const parseResult = parse(context)(server);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.annotations;
      expect(parseResult).to.contain.warning("Server variable 'location' is not present in the URL and will be discarted");

      const resource = parseResult.get(0);
      expect(resource).to.be.instanceof(namespace.elements.Resource);

      const { hrefVariables } = resource;
      const firstHrefVariable = hrefVariables.content.content[0];
      const secondHrefVariable = hrefVariables.content.content[1];

      expect(hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
      expect(hrefVariables.length).to.equal(2);

      expect(firstHrefVariable).to.be.instanceof(namespace.elements.Member);
      expect(firstHrefVariable.key.toValue()).to.equal('username');
      expect(firstHrefVariable.value.default).to.equal('Mario');
      expect(firstHrefVariable.value.description.toValue()).to.equal('API user name');

      expect(secondHrefVariable).to.be.instanceof(namespace.elements.Member);
      expect(secondHrefVariable.key.toValue()).to.equal('version');
      expect(secondHrefVariable.value.default).to.equal('1.0');
    });

    it("warns when a URL defined variable is missing from 'variables'", () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.{server}/{version}/',
        variables: {
          username: {
            default: 'Mario',
            description: 'API user name',
          },
          version: {
            default: '1.0',
          },
        },
      });

      const parseResult = parse(context)(server);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.annotations;
      expect(parseResult).to.contain.warning("URL variable 'server' is missing within the server variables");

      const resource = parseResult.get(0);
      expect(resource).to.be.instanceof(namespace.elements.Resource);

      const { hrefVariables } = resource;
      const firstHrefVariable = hrefVariables.content.content[0];
      const secondHrefVariable = hrefVariables.content.content[1];

      expect(hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
      expect(hrefVariables.length).to.equal(2);

      expect(firstHrefVariable).to.be.instanceof(namespace.elements.Member);
      expect(firstHrefVariable.key.toValue()).to.equal('username');
      expect(firstHrefVariable.value.default).to.equal('Mario');
      expect(firstHrefVariable.value.description.toValue()).to.equal('API user name');

      expect(secondHrefVariable).to.be.instanceof(namespace.elements.Member);
      expect(secondHrefVariable.key.toValue()).to.equal('version');
      expect(secondHrefVariable.value.default).to.equal('1.0');
    });

    it('parse server object with variables', () => {
      const server = new namespace.elements.Object({
        url: 'https://{username}.gigantic-server.com/{version}',
        variables: {
          username: {
            default: 'Mario',
            description: 'API user name',
          },
          version: {
            default: '1.0',
          },
        },
      });

      const parseResult = parse(context)(server);
      expect(parseResult).to.not.contain.annotations;
      expect(parseResult.length).to.equal(1);

      const resource = parseResult.get(0);
      expect(resource).to.be.instanceof(namespace.elements.Resource);

      const { hrefVariables } = resource;
      const firstHrefVariable = hrefVariables.content.content[0];
      const secondHrefVariable = hrefVariables.content.content[1];

      expect(hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
      expect(hrefVariables.length).to.equal(2);

      expect(firstHrefVariable).to.be.instanceof(namespace.elements.Member);
      expect(firstHrefVariable.key.toValue()).to.equal('username');
      expect(firstHrefVariable.value.default).to.equal('Mario');
      expect(firstHrefVariable.value.description.toValue()).to.equal('API user name');

      expect(secondHrefVariable).to.be.instanceof(namespace.elements.Member);
      expect(secondHrefVariable.key.toValue()).to.equal('version');
      expect(secondHrefVariable.value.default).to.equal('1.0');
    });
  });
});
