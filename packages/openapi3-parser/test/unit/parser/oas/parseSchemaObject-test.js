const { Fury } = require('@apielements/core');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseSchemaObject');
const Context = require('../../../../lib/context');
const { isArray, isObject } = require('../../../../lib/predicates');

const { minim: namespace } = new Fury();

describe('Schema Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides a warning when schema is non-object', () => {
    const schema = new namespace.elements.String('my schema');
    const parseResult = parse(context, schema);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Schema Object' is not an object");
  });

  describe('#type', () => {
    it('warns when type is unexpected on OpenAPI 3.0', () => {
      const schema = new namespace.elements.Object({
        type: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning("'Schema Object' 'type' is not a string");
    });

    it('warns when type is unexpected on OpenAPI 3.1', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const schema = new namespace.elements.Object({
        type: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning("'Schema Object' 'type' is not a string or an array");
    });

    it('warns when type is not a valid type', () => {
      const schema = new namespace.elements.Object({
        type: 'invalid',
      });
      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning(
        "'Schema Object' 'type' must be either boolean, object, array, number, string, integer"
      );
    });

    it('returns a data structure representing all types excluding null for no type limitations on OpenAPI less than 3.1', () => {
      const schema = new namespace.elements.Object({});
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);

      expect(element.enumerations.length).to.equal(5);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Number);
      expect(element.enumerations.get(2)).to.be.instanceof(namespace.elements.Boolean);
      expect(element.enumerations.get(3)).to.be.instanceof(namespace.elements.Object);
      expect(element.enumerations.get(4)).to.be.instanceof(namespace.elements.Array);
      expect(element.attributes.getValue('typeAttributes')).to.be.undefined;
    });

    it('returns a data structure representing all types for no type limitations on OpenAPI 3.1', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const schema = new namespace.elements.Object({});
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);

      expect(element.enumerations.length).to.equal(5);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Number);
      expect(element.enumerations.get(2)).to.be.instanceof(namespace.elements.Boolean);
      expect(element.enumerations.get(3)).to.be.instanceof(namespace.elements.Object);
      expect(element.enumerations.get(4)).to.be.instanceof(namespace.elements.Array);
      expect(element.attributes.getValue('typeAttributes')).to.deep.equal(['nullable']);
    });

    describe('when type is a string', () => {
      it('returns a boolean structure for boolean type', () => {
        const schema = new namespace.elements.Object({
          type: 'boolean',
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const string = parseResult.get(0).content;
        expect(string).to.be.instanceof(namespace.elements.Boolean);
      });

      it('returns an object structure for object type', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const object = parseResult.get(0).content;
        expect(object).to.be.instanceof(namespace.elements.Object);
      });

      it('returns an array structure for array type', () => {
        const schema = new namespace.elements.Object({
          type: 'array',
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const array = parseResult.get(0).content;
        expect(array).to.be.instanceof(namespace.elements.Array);
      });

      it('returns a number structure for number type', () => {
        const schema = new namespace.elements.Object({
          type: 'number',
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const string = parseResult.get(0).content;
        expect(string).to.be.instanceof(namespace.elements.Number);
      });

      it('returns a string structure for string type', () => {
        const schema = new namespace.elements.Object({
          type: 'string',
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const string = parseResult.get(0).content;
        expect(string).to.be.instanceof(namespace.elements.String);
      });

      it('returns a number structure for integer type', () => {
        const schema = new namespace.elements.Object({
          type: 'integer',
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const string = parseResult.get(0).content;
        expect(string).to.be.instanceof(namespace.elements.Number);
      });

      it('returns a warning for null type on OpenAPI prior 3.1', () => {
        const schema = new namespace.elements.Object({
          type: 'null',
        });
        const parseResult = parse(context, schema);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'type' must be either boolean, object, array, number, string, integer"
        );
      });

      it('returns a null structure for null type on OpenAPI 3.1', () => {
        context.openapiVersion = { major: 3, minor: 1 };
        const schema = new namespace.elements.Object({
          type: 'null',
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const element = parseResult.get(0).content;
        expect(element).to.be.instanceof(namespace.elements.Null);
        expect(element.attributes.getValue('typeAttributes')).to.be.undefined;
      });
    });

    describe('when type is an array', () => {
      beforeEach(() => {
        context = new Context(namespace);
        context.openapiVersion = { major: 3, minor: 1 };
      });

      it('warns when using array on OpenAPI 3.0', () => {
        context.openapiVersion = { major: 3, minor: 0 };

        const schema = new namespace.elements.Object({
          type: [],
        });
        const parseResult = parse(context, schema);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'type' is not a string"
        );
      });

      it('warns when array items is empty', () => {
        const schema = new namespace.elements.Object({
          type: [],
        });
        const parseResult = parse(context, schema);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'type' array must contain at least one type"
        );
      });

      it('warns when array items are not a string', () => {
        const schema = new namespace.elements.Object({
          type: [true],
        });
        const parseResult = parse(context, schema);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'type' array value is not a string"
        );
      });

      it('warns when array items are not valid types', () => {
        const schema = new namespace.elements.Object({
          type: ['invalid'],
        });
        const parseResult = parse(context, schema);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'type' array must only contain values: boolean, object, array, number, string, integer, null"
        );
      });

      it('warns when array items are duplicated', () => {
        const schema = new namespace.elements.Object({
          type: ['string', 'string'],
        });
        const parseResult = parse(context, schema);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'type' array must contain unique items, string is already present"
        );
      });

      it('warns when array items contain more than 1 entry', () => {
        // FIXME support more than one entry :)
        const schema = new namespace.elements.Object({
          type: ['string', 'number'],
        });
        const parseResult = parse(context, schema);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'type' more than one type is current unsupported"
        );
      });

      it('when type contains a single value', () => {
        const schema = new namespace.elements.Object({
          type: ['string'],
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const string = parseResult.get(0).content;
        expect(string).to.be.instanceof(namespace.elements.String);
      });

      it('when type contains a single value with null', () => {
        const schema = new namespace.elements.Object({
          type: ['string', 'null'],
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const string = parseResult.get(0).content;
        expect(string).to.be.instanceof(namespace.elements.String);
        expect(string.attributes.getValue('typeAttributes')).to.deep.equal(['nullable']);
      });
    });
  });

  describe('#enum', () => {
    it('warns when enum is not an array', () => {
      const schema = new namespace.elements.Object({
        enum: 1,
      });
      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning(
        "'Schema Object' 'enum' is not an array"
      );
    });

    it('returns an enumeration for enum of number', () => {
      const schema = new namespace.elements.Object({
        enum: [1],
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumElement = parseResult.get(0).content;
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
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumElement = parseResult.get(0).content;
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
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumElement = parseResult.get(0).content;
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
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumElement = parseResult.get(0).content;
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
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumElement = parseResult.get(0).content;
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
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumElement = parseResult.get(0).content;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);

      expect(enumeration).to.be.instanceof(namespace.elements.Object);
      expect(enumeration.toValue()).to.deep.equal({ message: 'Hello' });
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });
  });

  describe('#const', () => {
    it('warns when used on OpenAPI 3.0', () => {
      const schema = new namespace.elements.Object({
        const: { message: 'Hello' },
      });
      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning(
        "'Schema Object' contains invalid key 'const'"
      );
    });

    it('returns a fixed element', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const schema = new namespace.elements.Object({
        const: { message: 'Hello' },
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Object);
      expect(element.toValue()).to.deep.equal({ message: 'Hello' });
      expect(element.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });
  });

  describe('object type', () => {
    describe('#required', () => {
      it('warns when required is not an array', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          required: {},
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(2);

        expect(parseResult).to.contain.warning(
          "'Schema Object' 'required' is not an array"
        );
      });

      it('warns when required is not an array of strings', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          required: [1, true],
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(3);

        expect(parseResult.warnings.toValue()).to.deep.equal([
          "'Schema Object' 'required' array value is not a string",
          "'Schema Object' 'required' array value is not a string",
        ]);
      });

      it('returns an object with members from required keys', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          required: ['name'],
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const object = parseResult.get(0).content;
        expect(object).to.be.instanceof(namespace.elements.Object);

        const name = object.getMember('name');
        expect(name.attributes.getValue('typeAttributes')).to.deep.equal(['required']);
      });

      it('returns an object with required properties by merging properties', () => {
        const schema = new namespace.elements.Object({
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        });
        const parseResult = parse(context, schema);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
        expect(parseResult).to.not.contain.annotations;

        const object = parseResult.get(0).content;
        expect(object).to.be.instanceof(namespace.elements.Object);

        const name = object.getMember('name');
        expect(name.attributes.getValue('typeAttributes')).to.deep.equal(['required']);
        expect(name.value).to.be.instanceof(namespace.elements.String);
      });
    });
  });

  describe('#properties', () => {
    it('warns when properties is not an object', () => {
      const schema = new namespace.elements.Object({
        properties: [],
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);

      expect(parseResult).to.contain.warning(
        "'Schema Object' 'properties' is not an object"
      );
    });

    it('returns an object with properties when type is object', () => {
      const schema = new namespace.elements.Object({
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const object = parseResult.get(0).content;
      expect(object).to.be.instanceof(namespace.elements.Object);

      const name = object.get('name');
      expect(name).to.be.instanceof(namespace.elements.String);
    });

    it('returns an enum including an object of properties without type object', () => {
      const schema = new namespace.elements.Object({
        properties: {
          name: { type: 'string' },
        },
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumeration = parseResult.get(0).content;
      expect(enumeration).to.be.instanceof(namespace.elements.Enum);

      const objects = enumeration.enumerations.filter(isObject);
      expect(objects.length).to.equal(1);

      const object = objects.get(0);
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
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const object = parseResult.get(0).content;
      expect(object).to.be.instanceof(namespace.elements.Object);

      const name = object.get('name');
      expect(name).to.be.instanceof(namespace.elements.Element);
      expect(name.element).to.equal('name');
    });
  });

  describe('#items', () => {
    it('warns when items is not an object', () => {
      const schema = new namespace.elements.Object({
        items: [],
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);

      expect(parseResult).to.contain.warning(
        "'Schema Object' is not an object"
      );
    });

    it('returns an array with fixed-type items when type is array', () => {
      const schema = new namespace.elements.Object({
        type: 'array',
        items: {
          type: 'string',
        },
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const array = parseResult.get(0).content;
      expect(array).to.be.instanceof(namespace.elements.Array);
      expect(array.attributes.getValue('typeAttributes')).to.deep.equal(['fixedType']);

      const items = array.get(0);
      expect(items).to.be.instanceof(namespace.elements.String);
    });

    it('returns an enum including the fixed array without type array', () => {
      const schema = new namespace.elements.Object({
        items: {
          type: 'string',
        },
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const enumeration = parseResult.get(0).content;
      expect(enumeration).to.be.instanceof(namespace.elements.Enum);

      const arrays = enumeration.enumerations.filter(isArray);
      expect(arrays.length).to.equal(1);

      const array = arrays.get(0);
      expect(array).to.be.instanceof(namespace.elements.Array);
      expect(array.attributes.getValue('typeAttributes')).to.deep.equal(['fixedType']);

      const items = array.get(0);
      expect(items).to.be.instanceof(namespace.elements.String);
    });
  });

  describe('#nullable', () => {
    it('warns when nullable is used with OpenAPI 3.1', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const schema = new namespace.elements.Object({
        nullable: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);

      expect(parseResult).to.contain.warning(
        "'Schema Object' 'nullable' is removed in OpenAPI 3.1, use 'null' in type"
      );
    });

    it('warns when nullable is not boolean', () => {
      const schema = new namespace.elements.Object({
        nullable: 1,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);

      expect(parseResult).to.contain.warning(
        "'Schema Object' 'nullable' is not a boolean"
      );
    });

    it('adds nullable type attribute to element', () => {
      const schema = new namespace.elements.Object({
        type: 'array',
        nullable: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element.attributes.get('typeAttributes').toValue()).to.deep.equal(['nullable']);
    });

    it('adds nullable type attribute to element with other typeAttributes', () => {
      const schema = new namespace.elements.Object({
        type: 'array',
        items: {
          type: 'string',
        },
        nullable: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element.attributes.get('typeAttributes').toValue()).to.deep.equal(['fixedType', 'nullable']);
    });
  });

  describe('#title', () => {
    it('warns when title is not a string', () => {
      const schema = new namespace.elements.Object({
        title: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);

      expect(parseResult).to.contain.warning(
        "'Schema Object' 'title' is not a string"
      );
    });

    it('adds a title to the returned element', () => {
      const schema = new namespace.elements.Object({
        title: 'User',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.title.toValue()).to.equal('User');
    });
  });

  describe('#description', () => {
    it('warns when description is not a string', () => {
      const schema = new namespace.elements.Object({
        description: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);

      expect(parseResult).to.contain.warning(
        "'Schema Object' 'description' is not a string"
      );
    });

    it('adds a description to the returned element', () => {
      const schema = new namespace.elements.Object({
        description: 'an example schema',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.description.toValue()).to.equal('an example schema');
    });
  });

  describe('#default', () => {
    it('adds a default value to the returned element', () => {
      const schema = new namespace.elements.Object({
        default: 'my default',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('default').toValue()).to.equal('my default');
    });

    it('adds a default value to the returned element when matching type', () => {
      const schema = new namespace.elements.Object({
        type: 'string',
        default: 'my default',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('default').toValue()).to.equal('my default');
    });

    it('adds a default value to the returned element when matching enum', () => {
      const schema = new namespace.elements.Object({
        enum: ['my default'],
        default: 'my default',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('default').toValue()).to.equal('my default');
    });

    it('allows a null default value when nullable is enabled without type', () => {
      const schema = new namespace.elements.Object({
        nullable: true,
        default: null,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('default').toValue()).to.equal(null);
    });

    it('allows a null default value when nullable is enabled with type', () => {
      const schema = new namespace.elements.Object({
        type: 'string',
        nullable: true,
        default: null,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('default').toValue()).to.equal(null);
    });

    it('allows a null default value with null type on OpenAPI 3.1', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const schema = new namespace.elements.Object({
        type: ['string', 'null'],
        default: null,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('default').toValue()).to.equal(null);
    });

    it('allows a null default value when nullable is enabled with enum', () => {
      const schema = new namespace.elements.Object({
        enum: ['my default'],
        nullable: true,
        default: null,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('default').toValue()).to.equal(null);
    });

    it('warns when default does not match expected type', () => {
      const schema = new namespace.elements.Object({
        type: 'number',
        default: 'my default',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning(
        "'Schema Object' 'default' does not match expected type 'number'"
      );
    });

    it('warns when default does not match expected types on OpenAPI 3.1', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const schema = new namespace.elements.Object({
        type: ['number', 'null'],
        default: 'my default',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning(
        "'Schema Object' 'default' does not match expected type 'number', 'null'"
      );
    });

    it('warns when default does not match enumeration value', () => {
      const schema = new namespace.elements.Object({
        type: 'string',
        enum: ['n', 'e', 's', 'w'],
        default: 'my default',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning(
        "'Schema Object' 'default' is not included in 'enum'"
      );
    });
  });

  describe('#example', () => {
    it('adds an example value to the returned element', () => {
      const schema = new namespace.elements.Object({
        example: 'an example',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('samples').toValue()).to.deep.equal(['an example']);
    });

    it('adds an example value to the returned element when matching type', () => {
      const schema = new namespace.elements.Object({
        type: 'string',
        example: 'an example',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('samples').toValue()).to.deep.equal(['an example']);
    });

    it('adds an example value to the returned element when matching enum', () => {
      const schema = new namespace.elements.Object({
        enum: ['an example'],
        example: 'an example',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('samples').toValue()).to.deep.equal(['an example']);
    });

    it('allows a null example value when nullable is enabled without type', () => {
      const schema = new namespace.elements.Object({
        nullable: true,
        example: null,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('samples').toValue()).to.deep.equal([null]);
    });

    it('allows a null example value when nullable is enabled with type', () => {
      const schema = new namespace.elements.Object({
        type: 'string',
        nullable: true,
        example: null,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('samples').toValue()).to.deep.equal([null]);
    });

    it('allows a null example value when nullable is enabled with enum', () => {
      const schema = new namespace.elements.Object({
        enum: ['n', 's', 'e', 'w'],
        nullable: true,
        example: null,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      const element = parseResult.get(0).content;
      expect(element.attributes.get('samples').toValue()).to.deep.equal([null]);
    });

    it('warns when example does not match expected type', () => {
      const schema = new namespace.elements.Object({
        type: 'string',
        example: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning(
        "'Schema Object' 'example' does not match expected type 'string'"
      );
    });

    it('warns when example does not match enumeration value', () => {
      const schema = new namespace.elements.Object({
        type: 'number',
        enum: [1, 2, 3],
        example: 'north',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning(
        "'Schema Object' 'example' is not included in 'enum'"
      );
    });
  });

  it('validates example and default values', () => {
    const schema = new namespace.elements.Object({
      type: 'number',
      example: 'north',
      default: 'east',
    });
    const parseResult = parse(context, schema);

    expect(parseResult.length).to.equal(3);
    expect(parseResult.warnings.toValue()).to.deep.equal([
      "'Schema Object' 'example' does not match expected type 'number'",
      "'Schema Object' 'default' does not match expected type 'number'",
    ]);
  });

  describe('#oneOf', () => {
    it('can parse oneOf', () => {
      const schema = new namespace.elements.Object({
        oneOf: [
          { type: 'string' },
          { type: 'number' },
        ],
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);

      expect(element.enumerations.length).to.equal(2);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Number);
    });

    it('can parse oneOf with description', () => {
      const schema = new namespace.elements.Object({
        oneOf: [
          { type: 'string' },
          { type: 'number' },
        ],
        description: 'string or number',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);
      expect(element.description.toValue()).to.equal('string or number');

      expect(element.enumerations.length).to.equal(2);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Number);
    });

    it('can parse oneOf with default', () => {
      const schema = new namespace.elements.Object({
        oneOf: [
          { type: 'string' },
          { type: 'number' },
        ],
        default: 'unset',
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);
      expect(element.attributes.getValue('default')).to.equal('unset');

      expect(element.enumerations.length).to.equal(2);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Number);
    });

    it('can parse oneOf with example', () => {
      const schema = new namespace.elements.Object({
        oneOf: [
          { type: 'string' },
          { type: 'number' },
        ],
        example: 52,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);
      expect(element.attributes.getValue('samples')).to.deep.equal([52]);

      expect(element.enumerations.length).to.equal(2);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Number);
    });

    it('can parse oneOf with nullable', () => {
      const schema = new namespace.elements.Object({
        oneOf: [
          { type: 'string' },
          { type: 'number' },
        ],
        nullable: true,
      });
      const parseResult = parse(context, schema);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(parseResult).to.not.contain.annotations;

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);
      expect(element.attributes.getValue('typeAttributes')).to.deep.equal(['nullable']);

      expect(element.enumerations.length).to.equal(2);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Number);
    });

    it('warns for unsupported oneOf with other schema properties', () => {
      const schema = new namespace.elements.Object({
        oneOf: [
          { type: 'string' },
          { type: 'array' },
        ],
        items: {
          type: 'string',
        },
      });
      const parseResult = parse(context, schema);

      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.DataStructure);

      expect(parseResult).to.contain.warning(
        "'Schema Object' has limited support for 'oneOf', use of 'items' with 'oneOf' is not supported"
      );

      const element = parseResult.get(0).content;
      expect(element).to.be.instanceof(namespace.elements.Enum);

      expect(element.enumerations.length).to.equal(2);
      expect(element.enumerations.get(0)).to.be.instanceof(namespace.elements.String);
      expect(element.enumerations.get(1)).to.be.instanceof(namespace.elements.Array);
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported property', () => {
      const schema = new namespace.elements.Object({
        deprecated: true,
      });

      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning(
        "'Schema Object' contains unsupported key 'deprecated'"
      );
    });

    it('provides invalid warning for unsupported OpenAPI 3.1 property on OpenAPI 3.0', () => {
      const schema = new namespace.elements.Object({
        if: true,
      });

      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning(
        "'Schema Object' contains invalid key 'if'"
      );
    });

    it('provides warning for unsupported OpenAPI 3.1 property', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const schema = new namespace.elements.Object({
        if: true,
      });

      const parseResult = parse(context, schema);

      expect(parseResult).to.contain.warning(
        "'Schema Object' contains unsupported key 'if'"
      );
    });
  });
});
