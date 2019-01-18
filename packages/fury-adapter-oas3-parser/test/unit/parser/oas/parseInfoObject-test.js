const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseInfoObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseInfoObject', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides error when info is non-object', () => {
    const info = new namespace.elements.String();

    const result = parse(context, info);

    expect(result.length).to.equal(1);
    expect(result).to.contain.error("'Info Object' is not an object");
  });

  describe('missing required properties', () => {
    it('provides error for missing title', () => {
      const info = new namespace.elements.Object({
        version: '1.0.0',
      });

      const result = parse(context, info);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Info Object' is missing required property 'title'");
    });

    it('provides error for missing version', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
      });

      const result = parse(context, info);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Info Object' is missing required property 'version'");
    });
  });

  describe('required property type checking', () => {
    it('provides error when title is non-string', () => {
      const info = new namespace.elements.Object({
        title: 1,
        version: '1.0.0',
      });

      const result = parse(context, info);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Info Object' 'title' is not a string");
    });

    it('provides error when version is non-string', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: 1,
      });

      const result = parse(context, info);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Info Object' 'version' is not a string");
    });
  });

  describe('optional property type checking', () => {
    it('provides warning when description is non-string', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        description: 1,
      });

      const result = parse(context, info);
      expect(result).to.contain.warning("'Info Object' 'description' is not a string");
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported termsOfService key', () => {
      const object = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        termsOfService: '',
      });

      const result = parse(context, object);

      expect(result.warnings.length).to.equal(1);
      expect(result).to.contain.warning("'Info Object' contains unsupported key 'termsOfService'");
    });

    it('provides warning for unsupported contact key', () => {
      const object = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        contact: {},
      });

      const result = parse(context, object);

      expect(result.warnings.length).to.equal(1);
      expect(result).to.contain.warning("'Info Object' contains unsupported key 'contact'");
    });

    it('provides warning for unsupported license key', () => {
      const object = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        license: {},
      });

      const result = parse(context, object);

      expect(result).to.contain.warning("'Info Object' contains unsupported key 'license'");
    });

    it('does not provide warning for Info Object extensions', () => {
      const object = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        'x-extension': {},
      });

      const result = parse(context, object);

      expect(result).to.not.contain.annotations;
    });

    it('provides warning for invalid keys', () => {
      const object = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        invalid: {},
      });

      const result = parse(context, object);

      expect(result).to.contain.warning("'Info Object' contains invalid key 'invalid'");
    });
  });

  it('provides api category with title and version', () => {
    const info = new namespace.elements.Object({
      title: 'My API',
      version: '1.0.0',
    });

    const result = parse(context, info);
    expect(result.length).to.equal(1);
    expect(result.api.classes.toValue()).to.deep.equal(['api']);
    expect(result.api.title.toValue()).to.equal('My API');
    expect(result.api.attributes.get('version').toValue()).to.equal('1.0.0');
  });

  it('provides api category with description', () => {
    const info = new namespace.elements.Object({
      title: 'My API',
      version: '1.0.0',
      description: 'My API Description',
    });

    const result = parse(context, info);
    expect(result.length).to.equal(1);
    expect(result.api.copy.toValue()).to.deep.equal(['My API Description']);
  });
});
