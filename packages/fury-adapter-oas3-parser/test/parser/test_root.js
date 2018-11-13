const { expect } = require('chai');
const { Fury } = require('fury');

const parseOASObject = require('../../lib/parser/root');

const minim = new Fury().minim;

describe('#parseOASObject', function () {
  it('provides error for valid document', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
    });

    const result = parseOASObject(minim, object);
    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal('OpenAPI 3 is unsupported');
  });

  it('provides error for missing openapi version', function () {
    const object = new minim.elements.Object({
      info: {},
      paths: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'OpenAPI Object' is missing required property 'openapi'");
  });

  it('provides error for missing info', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      paths: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'OpenAPI Object' is missing required property 'info'");
  });

  it('provides error for missing paths', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'OpenAPI Object' is missing required property 'paths'");
  });

  it('provides warning for unsupported keys', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      invalid: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it('provides warning for unsupported security key', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      security: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'security'");
  });

  it('provides warning for unsupported tags key', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      tags: [],
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'tags'");
  });

  it('provides warning for unsupported externalDocs key', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      externalDocs: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'externalDocs'");
  });

  it('provides warning for unsupported components key', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      components: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'components'");
  });

  it('provides warning for unsupported servers key', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      servers: [],
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains unsupported key 'servers'");
  });

  it('provides warning for invalid keys', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
      paths: {},
      invalid: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'OpenAPI Object' contains invalid key 'invalid'");
  });

  it("doesn't provide warning for OpenAPI Object extensions", function () {
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
