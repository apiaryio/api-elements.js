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
    expect(result.errors.get(0).toValue()).to.equal("OpenAPI Object is missing required property 'openapi'");
  });

  it('provides error for missing info', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      paths: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("OpenAPI Object is missing required property 'info'");
  });

  it('provides error for missing paths', function () {
    const object = new minim.elements.Object({
      openapi: '3.0.0',
      info: {},
    });

    const result = parseOASObject(minim, object);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("OpenAPI Object is missing required property 'paths'");
  });
});
