const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseComponentsObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Components Object', () => {
  it('provides a warning when components is non-object', () => {
    const components = new namespace.elements.String();

    const result = parse(new Context(namespace), components);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Components Object' is not an object");
  });

  describe('#schemas', () => {
    it('provides a warning when schemas is non-object', () => {
      const components = new namespace.elements.Object({
        schemas: '',
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' 'schemas' is not an object");
    });

    it('parses valid schemas into data structures', () => {
      const components = new namespace.elements.Object({
        schemas: {
          User: {
            type: 'object',
          },
        },
      });

      const result = parse(new Context(namespace), components);
      expect(result.length).to.equal(1);

      const parsedComponents = result.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const schemas = parsedComponents.get('schemas');
      expect(schemas).to.be.instanceof(namespace.elements.Object);
      expect(schemas.get('User')).to.be.instanceof(namespace.elements.DataStructure);
    });
  });

  describe('#parameters', () => {
    it('provides a warning when parameters is non-object', () => {
      const components = new namespace.elements.Object({
        parameters: '',
      });

      const result = parse(new Context(namespace), components);
      expect(result).to.contain.warning("'Components Object' 'parameters' is not an object");
    });

    it('parses valid parameters', () => {
      const components = new namespace.elements.Object({
        parameters: {
          limitParam: {
            name: 'limit',
            in: 'query',
          },
        },
      });

      const result = parse(new Context(namespace), components);
      expect(result.length).to.equal(1);

      const parsedComponents = result.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const parameters = parsedComponents.get('parameters');
      expect(parameters).to.be.instanceof(namespace.elements.Object);
      expect(parameters.get('limitParam')).to.be.instanceof(namespace.elements.Member);
      expect(parameters.get('limitParam').key.toValue()).to.equal('limit');
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported responses key', () => {
      const components = new namespace.elements.Object({
        responses: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains unsupported key 'responses'");
    });

    it('provides warning for unsupported examples key', () => {
      const components = new namespace.elements.Object({
        examples: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains unsupported key 'examples'");
    });

    it('provides warning for unsupported requestBodies key', () => {
      const components = new namespace.elements.Object({
        requestBodies: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains unsupported key 'requestBodies'");
    });

    it('provides warning for unsupported headers key', () => {
      const components = new namespace.elements.Object({
        headers: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains unsupported key 'headers'");
    });

    it('provides warning for unsupported securitySchemes key', () => {
      const components = new namespace.elements.Object({
        securitySchemes: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains unsupported key 'securitySchemes'");
    });

    it('provides warning for unsupported links key', () => {
      const components = new namespace.elements.Object({
        links: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains unsupported key 'links'");
    });

    it('provides warning for unsupported callbacks key', () => {
      const components = new namespace.elements.Object({
        callbacks: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains unsupported key 'callbacks'");
    });

    it('does not provide warning for Info Object extensions', () => {
      const components = new namespace.elements.Object({
        'x-extension': {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.not.contain.annotations;
    });

    it('provides warning for invalid keys', () => {
      const components = new namespace.elements.Object({
        invalid: {},
      });

      const result = parse(new Context(namespace), components);

      expect(result).to.contain.warning("'Components Object' contains invalid key 'invalid'");
    });
  });
});
