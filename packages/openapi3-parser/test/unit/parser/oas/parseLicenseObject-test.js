const { Fury } = require('@apielements/core');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseLicenseObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();
const { Link } = namespace.elements;

describe('#parseLicenseObject', () => {
  let context;

  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when license is non-object', () => {
    const license = new namespace.elements.String();

    const parseResult = parse(context)(license);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'License Object' is not an object");
  });

  describe('#name', () => {
    it('provides warning for missing required name', () => {
      const license = new namespace.elements.Object({});

      const parseResult = parse(context)(license);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'License Object' is missing required property 'name'");
    });

    it('provides warning when name is non-string', () => {
      const license = new namespace.elements.Object({
        name: 1,
      });

      const parseResult = parse(context)(license);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'License Object' 'name' is not a string");
    });
  });

  describe('#url', () => {
    it('provides warning when description is non-string', () => {
      const license = new namespace.elements.Object({
        name: 'Apache 2.0',
        url: 1,
      });

      const parseResult = parse(context)(license);
      expect(parseResult).to.contain.warning("'License Object' 'url' is not a string");
    });
  });

  describe('warnings for unsupported properties', () => {
    it('does not provide warning for license Object extensions', () => {
      const object = new namespace.elements.Object({
        name: 'Apache 2.0',
        'x-extension': {},
      });

      const parseResult = parse(context)(object);

      expect(parseResult).to.not.contain.annotations;
    });

    it('provides warning for unsupported OpenAPI 3.1 keys', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const object = new namespace.elements.Object({
        name: 'Apache 2.0',
        identifier: 'MIT',
      });

      const parseResult = parse(context)(object);

      expect(parseResult).to.contain.warning("'License Object' contains unsupported key 'identifier'");
    });

    it('provides warning for invalid keys', () => {
      const object = new namespace.elements.Object({
        name: 'Apache 2.0',
        invalid: {},
      });

      const parseResult = parse(context)(object);

      expect(parseResult).to.contain.warning("'License Object' contains invalid key 'invalid'");
    });
  });

  it('provides license link for license with name', () => {
    const license = new namespace.elements.Object({
      name: 'Apache 2.0',
    });

    const parseResult = parse(context)(license);
    expect(parseResult.length).to.equal(1);
    const link = parseResult.get(0);

    expect(link).to.be.instanceof(Link);
    expect(link.relation.toValue()).to.equal('license');
    expect(link.title.toValue()).to.equal('Apache 2.0');
    expect(link.href.toValue()).to.equal('http://purl.org/atompub/license#unspecified');
  });

  it('provides license link for license with name and url', () => {
    const license = new namespace.elements.Object({
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    });

    const parseResult = parse(context)(license);
    expect(parseResult.length).to.equal(1);
    const link = parseResult.get(0);

    expect(link).to.be.instanceof(Link);
    expect(link.relation.toValue()).to.equal('license');
    expect(link.title.toValue()).to.equal('Apache 2.0');
    expect(link.href.toValue()).to.equal('https://www.apache.org/licenses/LICENSE-2.0.html');
  });
});
