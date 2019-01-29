const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseSchemaObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Schema Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides a warning when schema is non-object', () => {
    const schema = new namespace.elements.String('my schema');
    const result = parse(context, schema);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Schema Object' is not an object");
  });

  describe('#type', () => {
    it('warns when type is not a string', () => {
      const schema = new namespace.elements.Object({
        type: ['null'],
      });
      const result = parse(context, schema);

      expect(result).to.contain.warning("'Schema Object' 'type' is not a string");
    });

    it('warns when type is not a valid type', () => {
      const schema = new namespace.elements.Object({
        type: 'invalid',
      });
      const result = parse(context, schema);

      expect(result).to.contain.warning(
        "'Schema Object' 'type' must be either null, boolean, object, array, number, string, integer"
      );
    });

    it('returns a null structure for null type', () => {
      const schema = new namespace.elements.Object({
        type: 'null',
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const element = result.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Null);
    });

    it('returns a boolean structure for boolean type', () => {
      const schema = new namespace.elements.Object({
        type: 'boolean',
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const string = result.get(0).content;
      expect(string).to.be.instanceof(namespace.elements.Boolean);
    });

    it('returns an object structure for object type', () => {
      const schema = new namespace.elements.Object({
        type: 'object',
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const object = result.get(0).content;
      expect(object).to.be.instanceof(namespace.elements.Object);
    });

    it('returns an array structure for array type', () => {
      const schema = new namespace.elements.Object({
        type: 'array',
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const array = result.get(0).content;
      expect(array).to.be.instanceof(namespace.elements.Array);
    });

    it('returns a number structure for number type', () => {
      const schema = new namespace.elements.Object({
        type: 'number',
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const string = result.get(0).content;
      expect(string).to.be.instanceof(namespace.elements.Number);
    });

    it('returns a string structure for string type', () => {
      const schema = new namespace.elements.Object({
        type: 'string',
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const string = result.get(0).content;
      expect(string).to.be.instanceof(namespace.elements.String);
    });

    it('returns a number structure for integer type', () => {
      const schema = new namespace.elements.Object({
        type: 'integer',
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const string = result.get(0).content;
      expect(string).to.be.instanceof(namespace.elements.Number);
    });
  });

  describe('#enum', () => {
    it('warns when enum is not an array', () => {
      const schema = new namespace.elements.Object({
        enum: 1,
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);

      expect(result).to.contain.warning(
        "'Schema Object' 'enum' is not an array"
      );
    });

    it('returns an enumeration for enum of number', () => {
      const schema = new namespace.elements.Object({
        enum: [1],
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const enumElement = result.get(0).content;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);

      expect(enumeration).to.be.instanceof(namespace.elements.Number);
      expect(enumeration.toValue()).to.equal(1);
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });

    it('returns an enumeration for enum of boolean', () => {
      const schema = new namespace.elements.Object({
        enum: [true],
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const enumElement = result.get(0).content;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);

      expect(enumeration).to.be.instanceof(namespace.elements.Boolean);
      expect(enumeration.toValue()).to.equal(true);
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });

    it('returns an enumeration for enum with null', () => {
      const schema = new namespace.elements.Object({
        enum: [null],
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const enumElement = result.get(0).content;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);

      expect(enumeration).to.be.instanceof(namespace.elements.Null);
      expect(enumeration.toValue()).to.equal(null);
      expect(enumeration.attributes.getValue('typeAttributes')).to.be.undefined;
    });

    it('returns an enumeration for enum with string', () => {
      const schema = new namespace.elements.Object({
        enum: ['connected'],
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const enumElement = result.get(0).content;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);

      expect(enumeration).to.be.instanceof(namespace.elements.String);
      expect(enumeration.toValue()).to.equal('connected');
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });

    it('returns an enumeration for enum with array', () => {
      const schema = new namespace.elements.Object({
        enum: [[1, 2]],
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const enumElement = result.get(0).content;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);

      expect(enumeration).to.be.instanceof(namespace.elements.Array);
      expect(enumeration.toValue()).to.deep.equal([1, 2]);
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });

    it('returns an enumeration for enum with object', () => {
      const schema = new namespace.elements.Object({
        enum: [{ message: 'Hello' }],
      });
      const result = parse(context, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const enumElement = result.get(0).content;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);

      expect(enumeration).to.be.instanceof(namespace.elements.Object);
      expect(enumeration.toValue()).to.deep.equal({ message: 'Hello' });
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });
  });

  describe('object type', () => {
    describe('#properties', () => {
      it('warns when properties is not an object', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          properties: [],
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(2);

        expect(result).to.contain.warning(
          "'Schema Object' 'properties' is not an object"
        );
      });

      it('returns an object with properties', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(result).to.not.contain.annotations;

        const object = result.get(0).content;
        expect(object).to.be.instanceof(namespace.elements.Object);

        const name = object.get('name');
        expect(name).to.be.instanceof(namespace.elements.String);
      });

      it('returns an object with properties including references', () => {
        context.state.components = new namespace.elements.Object({
          schemas: {
            name: { type: 'object' },
          },
        });
        const schema = new namespace.elements.Object({
          type: 'object',
          properties: {
            name: { $ref: '#/components/schemas/name' },
          },
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(result).to.not.contain.annotations;

        const object = result.get(0).content;
        expect(object).to.be.instanceof(namespace.elements.Object);

        const name = object.get('name');
        expect(name).to.be.instanceof(namespace.elements.Element);
        expect(name.element).to.equal('name');
      });
    });

    describe('#required', () => {
      it('warns when required is not an array', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          required: {},
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(2);

        expect(result).to.contain.warning(
          "'Schema Object' 'required' is not an array"
        );
      });

      it('warns when required is not an array of strings', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          required: [1, true],
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(3);

        expect(result.warnings.toValue()).to.deep.equal([
          "'Schema Object' 'required' array value is not a string",
          "'Schema Object' 'required' array value is not a string",
        ]);
      });

      it('returns an object with required properties', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(result).to.not.contain.annotations;

        const object = result.get(0).content;
        expect(object).to.be.instanceof(namespace.elements.Object);

        const name = object.getMember('name');
        expect(name.attributes.getValue('typeAttributes')).to.deep.equal(['required']);
        expect(name.value).to.be.instanceof(namespace.elements.String);
      });
    });
  });

  describe('array type', () => {
    describe('#items', () => {
      it('warns when items is not an object', () => {
        const schema = new namespace.elements.Object({
          type: 'array',
          items: [],
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(2);

        expect(result).to.contain.warning(
          "'Schema Object' is not an object"
        );
      });

      it('returns an array with fixed-type items', () => {
        const schema = new namespace.elements.Object({
          type: 'array',
          items: {
            type: 'string',
          },
        });
        const result = parse(context, schema);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(result).to.not.contain.annotations;

        const array = result.get(0).content;
        expect(array).to.be.instanceof(namespace.elements.Array);
        expect(array.attributes.getValue('typeAttributes')).to.deep.equal(['fixedType']);

        const items = array.get(0);
        expect(items).to.be.instanceof(namespace.elements.String);
      });
    });
  });
});
