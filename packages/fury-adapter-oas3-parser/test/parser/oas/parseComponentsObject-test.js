const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseComponentsObject');

const { minim } = new Fury();

describe('Components Object', () => {
  it('provides a warning when components is non-object', () => {
    const components = new minim.elements.String();

    const result = parse(minim, components);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'Components Object' is not an object");
  });

  describe('#schemas', () => {
    it('provides a warning when schemas is non-object', () => {
      const components = new minim.elements.Object({
        schemas: '',
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' 'schemas' is not an object");
    });

    it('parses valid schemas into data structures', () => {
      const components = new minim.elements.Object({
        schemas: {
          User: {
            type: 'object',
          },
        },
      });

      const result = parse(minim, components);
      expect(result.length).to.equal(1);

      const parsedComponents = result.get(0);
      expect(parsedComponents).to.be.instanceof(minim.elements.Object);

      const schemas = parsedComponents.get('schemas');
      expect(schemas).to.be.instanceof(minim.elements.Object);
      expect(schemas.get('User')).to.be.instanceof(minim.elements.DataStructure);
    });
  });

  describe('#parameters', () => {
    it('provides a warning when parameters is non-object', () => {
      const components = new minim.elements.Object({
        parameters: '',
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' 'parameters' is not an object");
    });

    it('parses valid parameters', () => {
      const components = new minim.elements.Object({
        parameters: {
          limitParam: {
            name: 'limit',
            in: 'query',
          },
        },
      });

      const result = parse(minim, components);
      expect(result.length).to.equal(1);

      const parsedComponents = result.get(0);
      expect(parsedComponents).to.be.instanceof(minim.elements.Object);

      const parameters = parsedComponents.get('parameters');
      expect(parameters).to.be.instanceof(minim.elements.Object);
      expect(parameters.get('limitParam')).to.be.instanceof(minim.elements.Member);
      expect(parameters.get('limitParam').key.toValue()).to.equal('limit');
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported responses key', () => {
      const components = new minim.elements.Object({
        responses: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains unsupported key 'responses'");
    });

    it('provides warning for unsupported examples key', () => {
      const components = new minim.elements.Object({
        examples: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains unsupported key 'examples'");
    });

    it('provides warning for unsupported requestBodies key', () => {
      const components = new minim.elements.Object({
        requestBodies: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains unsupported key 'requestBodies'");
    });

    it('provides warning for unsupported headers key', () => {
      const components = new minim.elements.Object({
        headers: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains unsupported key 'headers'");
    });

    it('provides warning for unsupported securitySchemes key', () => {
      const components = new minim.elements.Object({
        securitySchemes: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains unsupported key 'securitySchemes'");
    });

    it('provides warning for unsupported links key', () => {
      const components = new minim.elements.Object({
        links: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains unsupported key 'links'");
    });

    it('provides warning for unsupported callbacks key', () => {
      const components = new minim.elements.Object({
        callbacks: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains unsupported key 'callbacks'");
    });

    it('does not provide warning for Info Object extensions', () => {
      const components = new minim.elements.Object({
        'x-extension': {},
      });

      const result = parse(minim, components);

      expect(result.annotations.length).to.equal(0);
    });

    it('provides warning for invalid keys', () => {
      const components = new minim.elements.Object({
        invalid: {},
      });

      const result = parse(minim, components);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Components Object' contains invalid key 'invalid'");
    });
  });
});
