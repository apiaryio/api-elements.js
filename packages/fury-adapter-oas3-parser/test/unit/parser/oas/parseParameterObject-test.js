const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseParameterObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Parameter Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when parameter is non-object', () => {
    const operation = new namespace.elements.String();

    const result = parse(context, operation);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Parameter Object' is not an object");
  });

  describe('#name', () => {
    it('provides an error when name is not a string', () => {
      const parameter = new namespace.elements.Object({
        name: 1,
        in: 'path',
      });

      const result = parse(context, parameter);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Parameter Object' 'name' is not a string");
    });

    it('provides an error when name contains unsupported characters', () => {
      const parameter = new namespace.elements.Object({
        name: 'hello!',
        in: 'path',
      });

      const result = parse(context, parameter);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Parameter Object' 'name' contains unsupported characters. Only alphanumeric characters are currently supported");
    });
  });

  describe('#in', () => {
    it('provides an error when value is not a string', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 1,
      });

      const result = parse(context, parameter);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Parameter Object' 'in' is not a string");
    });

    it('provides an error when value is not a permitted value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'space',
      });

      const result = parse(context, parameter);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Parameter Object' 'in' must be either 'query, 'header', 'path' or 'cookie'");
    });

    it('provides an unsupported error for header parameters', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'header',
      });

      const result = parse(context, parameter);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("Only 'in' values of 'path' and 'query' are supported at the moment");
    });

    it('provides an unsupported error for cookie parameters', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'cookie',
      });

      const result = parse(context, parameter);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("Only 'in' values of 'path' and 'query' are supported at the moment");
    });
  });

  describe('#description', () => {
    it('attaches description to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        description: 'an example parameter',
      });

      const result = parse(context, parameter);

      expect(result).to.not.contain.annotations;
      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(result.get(0).description.toValue()).to.equal(
        'an example parameter'
      );
    });

    it('provides a warning when description is not a string', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        description: true,
      });

      const result = parse(context, parameter);

      expect(result).to.contain.warning("'Parameter Object' 'description' is not a string");
    });
  });

  describe('#required', () => {
    it('create typeAttribute required', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        required: true,
      });

      const result = parse(context, parameter);

      expect(result).to.not.contain.annotations;

      expect(result.length).to.be.equal(1);

      expect(result.get(0)).to.be.instanceof(namespace.elements.Member);
      const typeAttributes = result.get(0).attributes.get('typeAttributes');

      expect(typeAttributes).to.be.instanceof(namespace.elements.Array);
      expect(typeAttributes.length).to.be.equal(1);
      expect(typeAttributes.contains('required')).to.be.true;
    });

    it('ignore required param if it is `false`', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        required: false,
      });

      const result = parse(context, parameter);

      expect(result.warnings.length).to.be.equal(0);

      expect(result.length).to.be.equal(1);

      expect(result.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(result.get(0).attributes.get('typeAttributes')).to.be.undefined;
    });

    it('provide warning if required is not bool', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        required: 1,
      });

      const result = parse(context, parameter);

      expect(result.length).to.be.equal(2); // parameter && warning
      expect(result.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(result.get(0).attributes.get('typeAttributes')).to.be.undefined;

      expect(result).to.contain.warning("'Parameter Object' 'required' is not a boolean");
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unknown deprecated property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        deprecated: true,
      });

      const result = parse(context, parameter);

      expect(result).to.contain.warning("'Parameter Object' contains unsupported key 'deprecated'");
    });

    it('provides warning for unknown deprecated property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        allowEmptyValue: true,
      });

      const result = parse(context, parameter);

      expect(result).to.contain.warning("'Parameter Object' contains unsupported key 'allowEmptyValue'");
    });

    it('does not provide warning/errors for extensions', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        'x-extension': '',
      });

      const result = parse(context, parameter);

      expect(result).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const parameter = new namespace.elements.Object({
      name: 'example',
      in: 'path',
      invalid: '',
    });

    const result = parse(context, parameter);

    expect(result).to.contain.warning("'Parameter Object' contains invalid key 'invalid'");
  });
});
