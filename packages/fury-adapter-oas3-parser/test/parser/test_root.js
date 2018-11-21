const { expect } = require('chai');
const { Fury } = require('fury');

const parseOASObject = require('../../lib/parser/root');

const { minim } = new Fury();

describe('#parseOASObject', () => {
  it('can parse a valid document', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
    });

    const result = parseOASObject(minim, object);
    expect(result.length).to.equal(1);
    expect(result.api.title.toValue()).to.equal('My API');
  });

  it('can parse a document with Path Item Objects', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {
        '/': {},
      },
    });

    const result = parseOASObject(minim, object);
    expect(result.length).to.equal(1);
    expect(result.api.title.toValue()).to.equal('My API');
    expect(result.api.length).to.equal(1);
    expect(result.api.get(0)).to.be.instanceof(minim.elements.Resource);
    expect(result.api.get(0).href.toValue()).to.equal('/');
  });

  it('provides error for missing openapi version', () => {
    const object = new minim.elements.Object({
      info: {},
      paths: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'OpenAPI Object' is missing required property 'openapi'");
  });

  it('provides error for missing info', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      paths: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'OpenAPI Object' is missing required property 'info'");
  });

  it('provides error for missing paths', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'OpenAPI Object' is missing required property 'paths'");
  });

  it('provides warning for unsupported keys', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      invalid: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it('provides warning for unsupported security key', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      security: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'security'");
  });

  it('provides warning for unsupported tags key', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      tags: [],
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'tags'");
  });

  it('provides warning for unsupported externalDocs key', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      externalDocs: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'externalDocs'");
  });

  it('provides warning for unsupported components key', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      components: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'components'");
  });

  it('provides warning for unsupported servers key', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      servers: [],
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'servers'");
  });

  it('provides warning for invalid keys', () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
      invalid: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it("doesn't provide warning for OpenAPI Object extensions", () => {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      'x-extension': {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.isEmpty).to.be.true;
  });
});
