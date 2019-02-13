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

    const parseResult = parse(context, operation);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Parameter Object' is not an object");
  });

  describe('#name', () => {
    it('provides an error when name is not a string', () => {
      const parameter = new namespace.elements.Object({
        name: 1,
        in: 'query',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Parameter Object' 'name' is not a string");
    });

    it('provides an error when name contains unsupported characters', () => {
      const parameter = new namespace.elements.Object({
        name: 'hello!',
        in: 'query',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Parameter Object' 'name' contains unsupported characters. Only alphanumeric characters are currently supported");
    });

    it('allows name to contain unreserved URI Template characters', () => {
      // as per https://tools.ietf.org/html/rfc6570#section-1.5
      const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digit = '0123456789';
      const unreserved = `${alpha}${digit}-._~`;

      const parameter = new namespace.elements.Object({
        name: unreserved,
        in: 'query',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).key.toValue()).to.equal(unreserved);
    });
  });

  describe('#in', () => {
    it('provides an error when value is not a string', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 1,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Parameter Object' 'in' is not a string");
    });

    it('provides an error when value is not a permitted value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'space',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Parameter Object' 'in' must be either 'query, 'header', 'path' or 'cookie'");
    });

    it('provides an unsupported error for header parameters', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'header',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Parameter Object' 'in' 'header' is unsupported");
    });

    it('provides an unsupported error for cookie parameters', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'cookie',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Parameter Object' 'in' 'cookie' is unsupported");
    });
  });

  describe('#description', () => {
    it('attaches description to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        description: 'an example parameter',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).description.toValue()).to.equal(
        'an example parameter'
      );
    });

    it('provides a warning when description is not a string', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        description: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' 'description' is not a string");
    });
  });

  describe('#example', () => {
    it('attaches string example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: 'example_value',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.equal('example_value');
    });

    it('attaches number example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: 42,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.equal(42);
    });

    it('attaches boolean example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: false,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.equal(false);
    });

    it('attaches array example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: [1, 3, 4],
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.deep.equal([1, 3, 4]);
    });

    it('attaches object example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: {
          foo: 1,
          bar: 'tada',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.deep.equal({
        foo: 1,
        bar: 'tada',
      });
    });
  });

  describe('#required', () => {
    it('create typeAttribute required', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        required: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.be.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);

      const typeAttributes = parseResult.get(0).attributes.get('typeAttributes');

      expect(typeAttributes).to.be.instanceof(namespace.elements.Array);
      expect(typeAttributes.length).to.be.equal(1);
      expect(typeAttributes.contains('required')).to.be.true;
    });

    it('ignore required param if it is `false`', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        required: false,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.be.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).attributes.get('typeAttributes')).to.be.undefined;
    });

    it('provide warning if required is not bool', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        required: 1,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.be.equal(2); // parameter && warning
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).attributes.get('typeAttributes')).to.be.undefined;

      expect(parseResult).to.contain.warning("'Parameter Object' 'required' is not a boolean");
    });

    it('provide warning if required does not exist for path parameter', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.be.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);

      const typeAttributes = parseResult.get(0).attributes.get('typeAttributes');

      expect(typeAttributes).to.be.instanceof(namespace.elements.Array);
      expect(typeAttributes.length).to.be.equal(1);
      expect(typeAttributes.contains('required')).to.be.true;

      expect(parseResult).to.contain.warning("'Parameter Object' 'required' must exist when 'in' is set to 'path'");
    });

    it('provide warning if required is `false` for path parameter', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        required: false,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.be.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);

      const typeAttributes = parseResult.get(0).attributes.get('typeAttributes');

      expect(typeAttributes).to.be.instanceof(namespace.elements.Array);
      expect(typeAttributes.length).to.be.equal(1);
      expect(typeAttributes.contains('required')).to.be.true;

      expect(parseResult).to.contain.warning("'Parameter Object' 'required' must be 'true' when 'in' is set to 'path'");
    });

    it('provide warning if required is not bool for path parameter', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        required: 1,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.be.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);

      const typeAttributes = parseResult.get(0).attributes.get('typeAttributes');

      expect(typeAttributes).to.be.instanceof(namespace.elements.Array);
      expect(typeAttributes.length).to.be.equal(1);
      expect(typeAttributes.contains('required')).to.be.true;

      expect(parseResult).to.contain.warning("'Parameter Object' 'required' is not a boolean");
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported deprecated property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        deprecated: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'deprecated'");
    });

    it('provides warning for unsupported allowEmptyValue property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        allowEmptyValue: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'allowEmptyValue'");
    });

    it('provides warning for unsupported style property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        style: 'simple',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'style'");
    });

    it('provides warning for unsupported explode property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        explode: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'explode'");
    });

    it('provides warning for unsupported allowReserved property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        allowReserved: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'allowReserved'");
    });

    it('provides warning for unsupported schema property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: { type: 'string' },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'schema'");
    });

    it('provides warning for unsupported examples property', () => {
      const parameter = new namespace.elements.Object({
        name: 'direction',
        in: 'query',
        examples: {},
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'examples'");
    });

    it('provides warning for unsupported content property', () => {
      const parameter = new namespace.elements.Object({
        name: 'direction',
        in: 'query',
        content: {},
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'content'");
    });

    it('does not provide warning/errors for extensions', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        'x-extension': '',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const parameter = new namespace.elements.Object({
      name: 'example',
      in: 'query',
      invalid: '',
    });

    const parseResult = parse(context, parameter);

    expect(parseResult).to.contain.warning("'Parameter Object' contains invalid key 'invalid'");
  });
});
