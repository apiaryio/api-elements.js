const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseParameterObject');

const { minim } = new Fury();

describe('Parameter Object', () => {
  it('provides warning when parameter is non-object', () => {
    const operation = new minim.elements.String();

    const result = parse(minim, operation);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Parameter Object' is not an object"
    );
  });

  describe('#name', () => {
    it('provides an error when name is not a string', () => {
      const parameter = new minim.elements.Object({
        name: 1,
        in: 'path',
      });

      const result = parse(minim, parameter);

      expect(result.length).to.equal(1);
      expect(result.errors.get(0).toValue()).to.equal(
        "'Parameter Object' 'name' is not a string"
      );
    });

    it('provides an error when name contains unsupported characters', () => {
      const parameter = new minim.elements.Object({
        name: 'hello!',
        in: 'path',
      });

      const result = parse(minim, parameter);

      expect(result.length).to.equal(1);
      expect(result.errors.get(0).toValue()).to.equal(
        "'Parameter Object' 'name' contains unsupported characters. Only alphanumeric characters are currently supported"
      );
    });
  });

  describe('#in', () => {
    it('provides an error when value is not a string', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 1,
      });

      const result = parse(minim, parameter);

      expect(result.length).to.equal(1);
      expect(result.errors.get(0).toValue()).to.equal(
        "'Parameter Object' 'in' is not a string"
      );
    });

    it('provides an error when value is not a permitted value', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'space',
      });

      const result = parse(minim, parameter);

      expect(result.length).to.equal(1);
      expect(result.errors.get(0).toValue()).to.equal(
        "'Parameter Object' 'in' must be either 'query, 'header', 'path' or 'cookie'"
      );
    });

    it('provides an unsupported error for header parameters', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'header',
      });

      const result = parse(minim, parameter);

      expect(result.length).to.equal(1);
      expect(result.errors.get(0).toValue()).to.equal(
        "Only 'in' values of 'path' and 'query' are supported at the moment"
      );
    });

    it('provides an unsupported error for cookie parameters', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'cookie',
      });

      const result = parse(minim, parameter);

      expect(result.length).to.equal(1);
      expect(result.errors.get(0).toValue()).to.equal(
        "Only 'in' values of 'path' and 'query' are supported at the moment"
      );
    });
  });

  describe('#description', () => {
    it('attaches description to member', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'path',
        description: 'an example parameter',
      });

      const result = parse(minim, parameter);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.Member);
      expect(result.get(0).description.toValue()).to.equal(
        'an example parameter'
      );
    });

    it('provides a warning when description is not a string', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'path',
        description: true,
      });

      const result = parse(minim, parameter);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Parameter Object' 'description' is not a string"
      );
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unknown required property', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'path',
        required: true,
      });

      const result = parse(minim, parameter);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Parameter Object' contains unsupported key 'required'"
      );
    });

    it('provides warning for unknown deprecated property', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'path',
        deprecated: true,
      });

      const result = parse(minim, parameter);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Parameter Object' contains unsupported key 'deprecated'"
      );
    });

    it('provides warning for unknown deprecated property', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'path',
        allowEmptyValue: true,
      });

      const result = parse(minim, parameter);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Parameter Object' contains unsupported key 'allowEmptyValue'"
      );
    });

    it('does not provide warning/errors for extensions', () => {
      const parameter = new minim.elements.Object({
        name: 'example',
        in: 'path',
        'x-extension': '',
      });

      const result = parse(minim, parameter);

      expect(result.annotations.isEmpty).to.be.true;
    });
  });

  it('provides warning for invalid keys', () => {
    const parameter = new minim.elements.Object({
      name: 'example',
      in: 'path',
      invalid: '',
    });

    const result = parse(minim, parameter);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Parameter Object' contains invalid key 'invalid'"
    );
  });
});
