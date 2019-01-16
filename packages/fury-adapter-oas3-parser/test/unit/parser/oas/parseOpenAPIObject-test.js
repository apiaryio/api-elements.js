const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseOpenAPIObject');

const { minim: namespace } = new Fury();

describe('#parseOpenAPIObject', () => {
  it('can parse a valid document', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
    });

    const result = parse(namespace, object);
    expect(result.length).to.equal(1);
    expect(result.api.title.toValue()).to.equal('My API');
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

    const result = parse(namespace, object);
    expect(result.length).to.equal(1);
    expect(result.api.title.toValue()).to.equal('My API');
    expect(result.api.length).to.equal(1);
    expect(result.api.get(0)).to.be.instanceof(namespace.elements.Resource);
    expect(result.api.get(0).href.toValue()).to.equal('/');
  });

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

    const result = parse(namespace, object);
    expect(result.length).to.equal(1);
    expect(result.api.title.toValue()).to.equal('My API');
    expect(result.api.length).to.equal(1);

    const dataStructures = result.api.get(0);
    expect(dataStructures).to.be.instanceof(namespace.elements.Category);
    expect(dataStructures.classes.toValue()).to.deep.equal(['dataStructures']);
    expect(dataStructures.length).to.equal(1);

    const userStructure = dataStructures.get(0);
    expect(userStructure).to.be.instanceof(namespace.elements.DataStructure);
    expect(userStructure.content.id.toValue()).to.equal('User');
  });

  it('provides error for missing openapi version', () => {
    const object = new namespace.elements.Object({
      info: {},
      paths: {},
    });

    const result = parse(namespace, object);

    expect(result).to.contain.error("'OpenAPI Object' is missing required property 'openapi'");
  });

  it('provides error for missing info', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      paths: {},
    });

    const result = parse(namespace, object);

    expect(result.length).to.equal(1);
    expect(result).to.contain.error("'OpenAPI Object' is missing required property 'info'");
  });

  it('provides error for missing paths', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {},
    });

    const result = parse(namespace, object);

    expect(result).to.contain.error("'OpenAPI Object' is missing required property 'paths'");
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

    const result = parse(namespace, object);

    expect(result).to.contain.warning("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it('provides warning for unsupported security key', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      security: {},
    });

    const result = parse(namespace, object);

    expect(result).to.contain.warning("'OpenAPI Object' contains unsupported key 'security'");
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

    const result = parse(namespace, object);

    expect(result).to.contain.warning("'OpenAPI Object' contains unsupported key 'tags'");
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

    const result = parse(namespace, object);

    expect(result).to.contain.warning("'OpenAPI Object' contains unsupported key 'externalDocs'");
  });

  it('provides warning for unsupported servers key', () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      servers: [],
    });

    const result = parse(namespace, object);

    expect(result).to.contain.warning("'OpenAPI Object' contains unsupported key 'servers'");
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

    const result = parse(namespace, object);

    expect(result).to.contain.warning("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it("doesn't provide warning for OpenAPI Object extensions", () => {
    const object = new namespace.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      'x-extension': {},
    });

    const result = parse(namespace, object);

    expect(result.warnings.isEmpty).to.be.true;
  });
});
