const { expect } = require('chai');
const { Fury } = require('fury');
const { DataStructureGenerator } = require('../lib/schema');

const namespace = new Fury().minim;

const {
  String: StringElement,
  Number: NumberElement,
  Boolean: BooleanElement,
  Null: NullElement,
  Array: ArrayElement,
  Object: ObjectElement,
  Member: MemberElement,
  Enum: EnumElement,
  Ref: RefElement,
} = namespace.elements;

function schemaToDataStructure(schema, root) {
  return new DataStructureGenerator(namespace, root).generateDataStructure(schema);
}

describe('JSON Schema to Data Structure', () => {
  it('null type schema', () => {
    const schema = {
      type: 'null',
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.be.instanceof(NullElement);
  });

  context('string schema', () => {
    it('produces string element from string type', () => {
      const schema = {
        type: 'string',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);
      expect(dataStructure.content.content).to.be.undefined;
    });

    it('produces string element with default value', () => {
      const schema = {
        type: 'string',
        default: 'doe',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);

      const defaultElement = dataStructure.content.attributes.get('default');
      expect(defaultElement).to.be.instanceof(StringElement);
      expect(defaultElement.toValue()).to.be.equal('doe');
    });

    it('produces string element with examples', () => {
      const schema = {
        type: 'string',
        example: 'doe',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);

      expect(dataStructure.toValue()).to.equal('doe');
    });

    it('produces string element with example', () => {
      const schema = {
        type: 'string',
        example: 'doe',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);

      expect(dataStructure.toValue()).to.equal('doe');
    });

    it('produces string element with samples for example type mismatch', () => {
      const schema = {
        type: 'string',
        example: 1,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);
      expect(dataStructure.toValue()).to.be.undefined;

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.deep.equal([1]);
    });

    it('produces string element with description describing pattern', () => {
      const schema = {
        type: 'string',
        pattern: '^hi',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Matches regex pattern: `^hi`');
    });

    it('produces string element with description maxLength', () => {
      const schema = {
        type: 'string',
        maxLength: 15,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Length of string must be less than, or equal to 15');
    });

    it('produces string element with description minLength', () => {
      const schema = {
        type: 'string',
        minLength: 2,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Length of string must be greater than, or equal to 2');
    });

    it('produces string element with description providing all validations', () => {
      const schema = {
        type: 'string',
        description: 'A simple string',
        minLength: 2,
        maxLength: 10,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('A simple string\n'
          + '\n'
          + '- Length of string must be less than, or equal to 10\n'
          + '- Length of string must be greater than, or equal to 2');
    });
  });

  context('boolean schema', () => {
    it('produces boolean element from boolean type', () => {
      const schema = {
        type: 'boolean',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(BooleanElement);
      expect(dataStructure.content.content).to.be.undefined;
    });

    it('produces boolean element with false default value', () => {
      const schema = {
        type: 'boolean',
        default: false,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(BooleanElement);

      const defaultElement = dataStructure.content.attributes.get('default');
      expect(defaultElement).to.be.instanceof(BooleanElement);
      expect(defaultElement.toValue()).to.equal(false);
    });

    it('produces boolean element with true default value', () => {
      const schema = {
        type: 'boolean',
        default: true,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(BooleanElement);

      const defaultElement = dataStructure.content.attributes.get('default');
      expect(defaultElement).to.be.instanceof(BooleanElement);
      expect(defaultElement.toValue()).to.equal(true);
    });

    it('produces boolean element with example', () => {
      const schema = {
        type: 'boolean',
        example: true,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(BooleanElement);

      expect(dataStructure.toValue()).to.equal(true);
    });
  });

  context('number schema', () => {
    it('produces number element from number type', () => {
      const schema = {
        type: 'number',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.content.content).to.be.undefined;
    });

    it('produces number element with default value', () => {
      const schema = {
        type: 'number',
        default: 15,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);

      const defaultElement = dataStructure.content.attributes.get('default');
      expect(defaultElement).to.be.instanceof(NumberElement);
      expect(defaultElement.toValue()).to.be.equal(15);
    });

    it('produces number element with example', () => {
      const schema = {
        type: 'number',
        example: 3,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.toValue()).to.equal(3);
    });

    it('produces number element with description of multipleOf', () => {
      const schema = {
        type: 'number',
        multipleOf: 2,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Number must be a multiple of 2');
    });

    it('produces number element with description of maximum', () => {
      const schema = {
        type: 'number',
        maximum: 10,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Number must be less than, or equal to 10');
    });

    it('produces number element with description of minimum', () => {
      const schema = {
        type: 'number',
        minimum: 1,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Number must be more than, or equal to 1');
    });

    it('produces number element with description of exclusiveMaximum', () => {
      const schema = {
        type: 'number',
        exclusiveMaximum: 10,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Number must be less than 10');
    });

    it('produces number element with description of exclusiveMinimum', () => {
      const schema = {
        type: 'number',
        exclusiveMinimum: 1,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Number must be more than 1');
    });
  });

  context('integer schema', () => {
    it('produces number element from integer type', () => {
      const schema = {
        type: 'integer',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);
      expect(dataStructure.content.content).to.be.undefined;
    });
  });

  context('object schema', () => {
    it('produces object data structure from object type', () => {
      const schema = {
        type: 'object',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);
    });

    it('produces object members from schema properties', () => {
      const schema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name',
          },
        },
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      expect(dataStructure.content.content[0].description.toValue()).to.equal('Name');
      const value = dataStructure.content.get('name');
      expect(value.element).to.equal('string');
    });

    it('produces object members from required schema properties', () => {
      const schema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name',
          },
        },
        required: ['name'],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      const member = dataStructure.content.content[0];
      expect(member.attributes.getValue('typeAttributes')).to.deep.equal(['required']);
    });

    it('produces object element with description of maxProperties', () => {
      const schema = {
        type: 'object',
        maxProperties: 5,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Object must have less than, or equal to 5 properties');
    });

    it('produces object element with description of minProperties', () => {
      const schema = {
        type: 'object',
        minProperties: 2,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Object must have more than, or equal to 2 properties');
    });

    it('produces object element from multiple allOf objects', () => {
      const schema = {
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
          {
            type: 'object',
            properties: {
              admin: {
                type: 'boolean',
              },
            },
            required: ['admin'],
          },
        ],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      const name = dataStructure.content.get('name');
      expect(name).not.to.be.undefined;

      const admin = dataStructure.content.getMember('admin');
      expect(admin).not.to.be.undefined;
      expect(admin.attributes.getValue('typeAttributes')).to.deep.equal(['required']);
    });

    it('produces object element from multiple allOf objects when schema root doesnt provide a type', () => {
      const schema = {
        allOf: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
          {
            type: 'object',
            properties: {
              admin: {
                type: 'boolean',
              },
            },
            required: ['admin'],
          },
        ],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      const name = dataStructure.content.get('name');
      expect(name).not.to.be.undefined;

      const admin = dataStructure.content.getMember('admin');
      expect(admin).not.to.be.undefined;
      expect(admin.attributes.getValue('typeAttributes')).to.deep.equal(['required']);
    });

    it('produces object element from properties when schema root doesnt provide a type', () => {
      const schema = {
        properties: {
          name: {
            type: 'string',
          },
        },
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      const name = dataStructure.content.get('name');
      expect(name).not.to.be.undefined;
    });

    it('produces object element from multiple allOf where one allOf is reference base type', () => {
      const schema = {
        allOf: [
          {
            $ref: '#/definitions/User',
          },
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        ],
      };

      const root = {
        definitions: {
          User: {
            type: 'object',
          },
        },
      };

      const dataStructure = schemaToDataStructure(schema, root);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);
      expect(dataStructure.content.element).to.equal('definitions/User');

      const name = dataStructure.content.get('name');
      expect(name).not.to.be.undefined;
    });

    it('produces object element from multiple allOf contain multiple reference to mixin objects', () => {
      const schema = {
        allOf: [
          {
            $ref: '#/definitions/User',
          },
          {
            $ref: '#/definitions/UserMixin',
          },
        ],
      };

      const root = {
        definitions: {
          User: {
            type: 'object',
          },
          UserMixin: {
            type: 'object',
          },
        },
      };

      const dataStructure = schemaToDataStructure(schema, root);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);
      expect(dataStructure.content.element).to.equal('object');

      expect(dataStructure.content.content.length).to.equal(2);
      expect(dataStructure.content.content[0]).to.be.instanceof(RefElement);
      expect(dataStructure.content.content[0].toValue()).to.equal('definitions/User');
      expect(dataStructure.content.content[1]).to.be.instanceof(RefElement);
      expect(dataStructure.content.content[1].toValue()).to.equal('definitions/UserMixin');
    });


    it('produces value from examples', () => {
      const schema = {
        type: 'object',
        example: {
          name: 'Doe',
        },
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);
      expect(dataStructure.toValue()).to.be.deep.equal({ name: 'Doe' });
    });

    it('produces samples from examples when we have properties', () => {
      const schema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        example: {
          name: 'Doe',
        },
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      expect(dataStructure.content.length).to.equal(1);
      const member = dataStructure.content.content[0];
      expect(member).to.be.instanceof(MemberElement);
      expect(member.key.toValue()).to.equal('name');
      expect(member.value).to.be.instanceof(StringElement);
      expect(member.value.content).to.be.undefined;

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.be.deep.equal([{ name: 'Doe' }]);
    });
  });

  context('array schema', () => {
    it('produces array data structure from array type', () => {
      const schema = {
        type: 'array',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
    });

    it('produces array data structure including subitem', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
        },
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.content.get(0).element).to.equal('string');
    });

    it('produces array data structure including sub items', () => {
      const schema = {
        type: 'array',
        items: [
          {
            type: 'number',
          },
          {
            type: 'string',
          },
        ],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.content.get(0).element).to.equal('number');
      expect(dataStructure.content.get(1).element).to.equal('string');
    });

    it('produces array element with description of maxItems', () => {
      const schema = {
        type: 'array',
        maxItems: 10,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Array length must be less than, or equal to 10');
    });

    it('produces array element with description of minItems', () => {
      const schema = {
        type: 'array',
        minItems: 1,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Array length must be more than, or equal to 1');
    });

    it('produces array element with description of minItems', () => {
      const schema = {
        type: 'array',
        minItems: 1,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Array length must be more than, or equal to 1');
    });

    it('produces array element with description of uniqueItems', () => {
      const schema = {
        type: 'array',
        uniqueItems: true,
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.content.description.toValue())
        .to.equal('- Array contents must be unique');
    });

    it('produces empty array element with empty items', () => {
      const schema = {
        type: 'array',
        items: {},
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.content.content.length).to.be.equal(0);
    });

    it('produces value from example', () => {
      const schema = {
        type: 'array',
        example: ['Doe'],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);
      expect(dataStructure.toValue()).to.be.deep.equal(['Doe']);
    });

    it('produces samples from example when we have items', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
        },
        example: 'Doe',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);

      expect(dataStructure.content.length).to.equal(1);
      expect(dataStructure.content.get(0)).to.be.instanceof(StringElement);
      expect(dataStructure.content.get(0).content).to.be.undefined;

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.be.deep.equal(['Doe']);
    });
  });

  it('errors for unknown type', () => {
    const schema = {
      type: 'unknown',
    };

    expect(() => schemaToDataStructure(schema))
      .to.throw("Unhandled schema type 'unknown'");
  });

  it('exposes the schema title', () => {
    const schema = {
      type: 'object',
      title: 'User',
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.be.instanceof(ObjectElement);
    expect(dataStructure.content.title.toValue()).to.equal('User');
  });

  it('exposes the schema description', () => {
    const schema = {
      type: 'object',
      description: 'A user',
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.be.instanceof(ObjectElement);
    expect(dataStructure.content.description.toValue()).to.equal('A user');
  });

  it('produces enum element for enum values', () => {
    const schema = {
      enum: ['one', 2, null],
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.be.instanceof(EnumElement);

    const enumerations = dataStructure.content.attributes.get('enumerations');

    expect(enumerations.length).to.equal(3);
    expect(enumerations.get(0)).to.be.instanceof(StringElement);
    expect(enumerations.get(0).attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    expect(enumerations.getValue(0)).to.equal('one');
    expect(enumerations.get(1)).to.be.instanceof(NumberElement);
    expect(enumerations.get(1).attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    expect(enumerations.getValue(1)).to.equal(2);
    expect(enumerations.get(2)).to.be.instanceof(NullElement);
    expect(enumerations.get(2).attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
  });

  it('produces samples for enum element', () => {
    const schema = {
      enum: ['one', 'two'],
      example: 'one',
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.be.instanceof(EnumElement);

    const { enumerations } = dataStructure.content;

    expect(enumerations.length).to.equal(2);
    expect(enumerations.get(0)).to.be.instanceof(StringElement);
    expect(enumerations.getValue(0)).to.equal('one');
    expect(enumerations.get(1)).to.be.instanceof(StringElement);
    expect(enumerations.getValue(1)).to.equal('two');

    const value = dataStructure.content.content;
    expect(value).to.be.instanceof(StringElement);
    expect(value.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    expect(value.toValue()).to.deep.equal('one');
  });

  it('produces default for enum element', () => {
    const schema = {
      enum: ['one', 'two'],
      default: 'one',
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.instanceof(EnumElement);

    const enumerations = dataStructure.content.attributes.get('enumerations');

    expect(enumerations.length).to.equal(2);
    expect(enumerations.get(0)).to.be.instanceof(StringElement);
    expect(enumerations.getValue(0)).to.equal('one');
    expect(enumerations.get(1)).to.be.instanceof(StringElement);
    expect(enumerations.getValue(1)).to.equal('two');

    const defaultElement = dataStructure.content.attributes.get('default');

    expect(defaultElement).to.be.instanceof(EnumElement);
    expect(defaultElement.toValue()).to.be.deep.equal('one');
    expect(defaultElement.content.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
  });

  it('produces description containing the schema format', () => {
    const schema = {
      type: 'string',
      format: 'email',
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.be.instanceof(StringElement);
    expect(dataStructure.content.description.toValue())
      .to.equal("- Value must be of format 'email'");
  });

  it('returns null when there is no type in the given JSON schema', () => {
    const schema = {};

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure).to.be.null;
  });

  it('adds nullable typeAttribute with x-nullable extension', () => {
    const schema = {
      type: 'string',
      'x-nullable': true,
    };

    const dataStructure = schemaToDataStructure(schema);

    expect(dataStructure.element).to.equal('dataStructure');
    expect(dataStructure.content).to.be.instanceof(StringElement);
    expect(dataStructure.content.attributes.getValue('typeAttributes')).to.deep.equal(['nullable']);
  });
});
