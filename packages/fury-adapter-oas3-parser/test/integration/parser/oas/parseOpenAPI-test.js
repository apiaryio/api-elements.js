const { expect } = require('chai');
const { Fury } = require('fury');

const parse = require('../../../../lib/parser/oas/parseOpenAPIObject');

const { minim: namespace } = new Fury();

describe('#parseOpenAPIObject', () => {
  it('exposes annotations based on user-defined order from source', () => {
    const object = new namespace.elements.Object({
      openapi: '3.1337.0',
      info: {
        title: 'My API',
        version: '1.0.0',
        invalid: true,
      },
      paths: {
        invalid: true,
      },
      components: {
        invalid: true,
      },
      invalid: true,
    });

    const result = parse(namespace, object);

    expect(result.annotations.toValue()).to.deep.equal([
      "Version '3.1337.0' is not fully supported",
      "'Info Object' contains invalid key 'invalid'",
      "'Paths Object' contains invalid key 'invalid'",
      "'Components Object' contains invalid key 'invalid'",
      "'OpenAPI Object' contains invalid key 'invalid'",
    ]);
  });
});
