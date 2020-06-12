const { Fury } = require('@apielements/core');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseOpenAPIObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseOpenAPIObject', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('can parse a valid document', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
    });

    const parseResult = parse(context, object);
    expect(parseResult.length).to.equal(1);
    expect(parseResult.api.title.toValue()).to.equal('My API');
  });

  it('can parse a document with Path Item Objects', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {
        '/': {},
      },
    });

    const parseResult = parse(context, object);
    expect(parseResult.length).to.equal(1);
    expect(parseResult.api.title.toValue()).to.equal('My API');
    expect(parseResult.api.length).to.equal(1);
    expect(parseResult.api.get(0)).to.be.instanceof(namespace.elements.Resource);
    expect(parseResult.api.get(0).href.toValue()).to.equal('/');
  });

  it('can parse a document with servers array', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      servers: [
        {
          url: 'https://{username}.server.com/1.0',
          variables: {
            username: {
              default: 'Mario',
              enum: ['Tony', 'Nina'],
            },
          },
        },
        {
          url: 'https://user.server.com/2.0',
          description: 'The production API server',
        },
      ],
    });

    const parseResult = parse(context, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.api.title.toValue()).to.equal('My API');
    expect(parseResult.api.length).to.equal(1);

    const hostsCategory = parseResult.api.get(0);
    expect(hostsCategory).to.be.instanceof(namespace.elements.Category);
    expect(hostsCategory.classes.toValue()).to.deep.equal(['hosts']);
    expect(hostsCategory.length).to.equal(2);

    const firstHost = hostsCategory.get(0);
    expect(firstHost).to.be.instanceof(namespace.elements.Resource);
    expect(firstHost.href.toValue()).to.equal('https://{username}.server.com/1.0');

    const { hrefVariables } = firstHost;
    expect(hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
    expect(hrefVariables.length).to.equal(1);

    const hrefVariable = hrefVariables.content[0];
    expect(hrefVariable).to.be.instanceof(namespace.elements.Member);
    expect(hrefVariable.key.toValue()).to.equal('username');
    expect(hrefVariable.value.attributes.get('default').toValue()).to.equal('Mario');

    const { enumerations } = hrefVariable.value;
    expect(enumerations).to.be.instanceof(namespace.elements.Array);
    expect(enumerations.length).to.equal(2);
    expect(enumerations.toValue()).to.deep.equal(['Tony', 'Nina']);
  });

  describe('with schema components', () => {
    it('can parse a document with schema components into data structures', () => {
      const object = new namespace.elements.Object({
        openapi: '3.0.0',
        info: {
          title: 'My API',
          version: '1.0.0',
        },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
            },
          },
        },
      });

      const parseResult = parse(context, object);
      expect(parseResult.length).to.equal(1);
      expect(parseResult.api.title.toValue()).to.equal('My API');
      expect(parseResult.api.length).to.equal(1);

      const dataStructures = parseResult.api.get(0);
      expect(dataStructures).to.be.instanceof(namespace.elements.Category);
      expect(dataStructures.classes.toValue()).to.deep.equal(['dataStructures']);
      expect(dataStructures.length).to.equal(1);

      const userStructure = dataStructures.get(0);
      expect(userStructure).to.be.instanceof(namespace.elements.DataStructure);
      expect(userStructure.content.id.toValue()).to.equal('User');
    });

    it('can parse a document with invalid schema component', () => {
      const object = new namespace.elements.Object({
        openapi: '3.0.0',
        info: {
          title: 'My API',
          version: '1.0.0',
        },
        paths: {},
        components: {
          schemas: {
            User: null,
          },
        },
      });

      const parseResult = parse(context, object);
      expect(parseResult.length).to.equal(2);
      expect(parseResult.api.title.toValue()).to.equal('My API');
      expect(parseResult.api.isEmpty).to.be.true;
    });
  });

  it('provides error for missing openapi version', () => {
    const object = new namespace.elements.Object({
      info: {},
      paths: {},
    });

    const parseResult = parse(context, object);

    expect(parseResult).to.contain.error("'OpenAPI Object' is missing required property 'openapi'");
  });

  it('provides error for missing info', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      paths: {},
    });

    const parseResult = parse(context, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.error("'OpenAPI Object' is missing required property 'info'");
  });

  it('provides error for missing paths', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {},
    });

    const parseResult = parse(context, object);

    expect(parseResult).to.contain.error("'OpenAPI Object' is missing required property 'paths'");
  });

  it('provides warning for unsupported keys', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      invalid: {},
    });

    const parseResult = parse(context, object);

    expect(parseResult).to.contain.warning("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it('provides warning for unsupported tags key', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      tags: [],
    });

    const parseResult = parse(context, object);

    expect(parseResult).to.contain.warning("'OpenAPI Object' contains unsupported key 'tags'");
  });

  it('provides warning for unsupported externalDocs key', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      externalDocs: {},
    });

    const parseResult = parse(context, object);

    expect(parseResult).to.contain.warning("'OpenAPI Object' contains unsupported key 'externalDocs'");
  });

  it('provides warning for invalid keys', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      invalid: {},
    });

    const parseResult = parse(context, object);

    expect(parseResult).to.contain.warning("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it("doesn't provide warning for OpenAPI Object extensions", () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      'x-extension': {},
    });

    const parseResult = parse(context, object);

    expect(parseResult.warnings.isEmpty).to.be.true;
  });
});
