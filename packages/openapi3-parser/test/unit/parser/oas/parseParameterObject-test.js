const { Fury } = require('@apielements/core');
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
        in: 'path',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.error("'Parameter Object' 'name' contains unsupported characters. Only alphanumeric characters are currently supported");
    });

    it('does not allow character `-` in path name', () => {
      const parameter = new namespace.elements.Object({
        name: 'not-allowed',
        in: 'path',
      });

      const parseResult = parse(context, parameter);

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

    it('auto pct-encode reserved chars in query name', () => {
      const reserved = '!*\'();:@&=+$,?%#[]';
      const encoded = '%21%2A%27%28%29%3B%3A%40%26%3D%2B%24%2C%3F%25%23%5B%5D';

      const parameter = new namespace.elements.Object({
        name: reserved,
        in: 'query',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).key.toValue()).to.equal(encoded);
    });

    it('avoid double encoding pct-encode in query name', () => {
      const input = 'user%5bname%5d';

      const parameter = new namespace.elements.Object({
        name: input,
        in: 'query',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).key.toValue()).to.equal(input);
    });

    it('handle throw while encoding query', () => {
      const parameter = new namespace.elements.Object({
        name: '\uD800',
        in: 'query',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.error('\'Parameter Object\' \'name\' in location \'query\' contains URI malformed characters');
    });

    it('allows header name to contain unreserved characters', () => {
      const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digit = '0123456789';
      const unreserved = `${alpha}${digit}-._~`;

      const parameter = new namespace.elements.Object({
        name: unreserved,
        in: 'header',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).key.toValue()).to.equal(unreserved);
    });

    describe('headers name do not allows reserved words', () => {
      it('does not allow `Accept`', () => {
        const parameter = new namespace.elements.Object({
          name: 'accept',
          in: 'header',
        });

        const parseResult = parse(context, parameter);

        expect(parseResult.length).to.equal(1);
        expect(parseResult).to.contain.warning('\'Parameter Object\' \'name\' in location \'header\' should not be \'Accept\', \'Content-Type\' or \'Authorization\'');
      });

      it('does not allow `Content-Type`', () => {
        const parameter = new namespace.elements.Object({
          name: 'Content-Type',
          in: 'header',
        });

        const parseResult = parse(context, parameter);

        expect(parseResult.length).to.equal(1);
        expect(parseResult).to.contain.warning('\'Parameter Object\' \'name\' in location \'header\' should not be \'Accept\', \'Content-Type\' or \'Authorization\'');
      });

      it('does not allow `Authorization', () => {
        const parameter = new namespace.elements.Object({
          name: 'AUTHORIZATION',
          in: 'header',
        });

        const parseResult = parse(context, parameter);

        expect(parseResult.length).to.equal(1);
        expect(parseResult).to.contain.warning('\'Parameter Object\' \'name\' in location \'header\' should not be \'Accept\', \'Content-Type\' or \'Authorization\'');
      });
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

    it('provides a warning when value is not a permitted value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'space',
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Parameter Object' 'in' must be either 'query', 'header', 'path' or 'cookie'");
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

    it('attaches integer example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: 10,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.equal(10);
    });

    it('attaches boolean example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.equal(true);
    });

    it('attaches array example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: [1, 2, 3, 4],
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.deep.equal([1, 2, 3, 4]);
    });

    it('attaches object example to member', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        example: {
          foo: 1,
          bar: 'baz',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value.toValue()).to.deep.equal({
        foo: 1,
        bar: 'baz',
      });
    });
  });

  describe('#explode', () => {
    it('provides a warning when explode is not a boolean', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        explode: 1,
      });

      const parseResult = parse(context, parameter);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Parameter Object' 'explode' is not a boolean");
    });

    it('provides an unsupported warning when explode is used in header parameter', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'header',
        explode: true,
      });

      const parseResult = parse(context, parameter);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Parameter Object' 'explode' is unsupported in header");
    });

    it('provides an unsupported warning when explode is used in path parameter', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'path',
        required: true,
        explode: true,
      });

      const parseResult = parse(context, parameter);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Parameter Object' 'explode' is unsupported in path");
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
      expect(typeAttributes.includes('required')).to.be.true;
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
      expect(typeAttributes.includes('required')).to.be.true;

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
      expect(typeAttributes.includes('required')).to.be.true;

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
      expect(typeAttributes.includes('required')).to.be.true;

      expect(parseResult).to.contain.warning("'Parameter Object' 'required' is not a boolean");
    });
  });

  describe('#schema', () => {
    it('uses boolean type schema as value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {
          type: 'boolean',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Boolean);
      expect(member.value.content).to.be.undefined;
    });

    it('uses number type schema as value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {
          type: 'number',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Number);
      expect(member.value.content).to.be.undefined;
    });

    it('uses integer type schema as value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {
          type: 'integer',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Number);
      expect(member.value.content).to.be.undefined;
    });

    it('uses string type schema as value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {
          type: 'integer',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Number);
      expect(member.value.content).to.be.undefined;
    });

    it('uses array type schema as value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {
          type: 'array',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Array);
      expect(member.value.content).to.deep.equal([]);
    });

    it('uses object type schema as value', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {
          type: 'object',
        },
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Object);
      expect(member.value.content).to.deep.equal([]);
    });

    it('ignores empty schema', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {},
      });

      const parseResult = parse(context, parameter);

      expect(parseResult.length).to.equal(1);
      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.undefined;
    });

    it('provides a warning when schema is not an object', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: [],
      });

      const parseResult = parse(context, parameter);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Schema Object' is not an object");
    });

    it('provides a warning when schema is a reference', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        schema: {
          $ref: '#/components/schema/Date',
        },
      });

      const parseResult = parse(context, parameter);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Schema Object' contains unsupported key '$ref'");
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

    it('provides warning for unsupported allowReserved property', () => {
      const parameter = new namespace.elements.Object({
        name: 'example',
        in: 'query',
        allowReserved: true,
      });

      const parseResult = parse(context, parameter);

      expect(parseResult).to.contain.warning("'Parameter Object' contains unsupported key 'allowReserved'");
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
