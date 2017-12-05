/* eslint-disable no-unused-expressions  */
// Allows chai `expect(null).to.be.null;`

import { expect } from 'chai';

import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';

import DataStructureGenerator from '../src/schema';

const namespace = minimModule.namespace()
  .use(minimParseResult);

const {
  String: StringElement,
  Number: NumberElement,
  Boolean: BooleanElement,
  Null: NullElement,
  Array: ArrayElement,
  Object: ObjectElement,
  Enum: EnumElement,
} = namespace.elements;

function schemaToDataStructure(schema) {
  return new DataStructureGenerator(namespace).generateDataStructure(schema);
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
      expect(dataStructure.content.content).to.be.null;
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
        examples: ['doe'],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.be.deep.equal(['doe']);
    });

    it('produces string element with example', () => {
      const schema = {
        type: 'string',
        example: 'doe',
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(StringElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.be.deep.equal(['doe']);
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
        .to.equal('A simple string\n' +
          '\n' +
          '- Length of string must be less than, or equal to 10\n' +
          '- Length of string must be greater than, or equal to 2');
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
      expect(dataStructure.content.content).to.be.null;
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

    it('produces boolean element with examples', () => {
      const schema = {
        type: 'boolean',
        examples: [true],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(BooleanElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.deep.equal([true]);
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
      expect(dataStructure.content.content).to.be.null;
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

    it('produces number element with examples', () => {
      const schema = {
        type: 'number',
        examples: [1, 2, 3],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(NumberElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.deep.equal([1, 2, 3]);
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
      expect(dataStructure.content.content).to.be.null;
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

    it('produces samples from examples', () => {
      const schema = {
        type: 'object',
        examples: [
          {
            name: 'Doe',
          },
        ],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.get(0)).to.be.instanceof(ObjectElement);
      expect(samples.toValue()).to.be.deep.equal([{ name: 'Doe' }]);
    });

    it('produces samples from example', () => {
      const schema = {
        type: 'object',
        example: {
          name: 'Doe',
        },
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ObjectElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.get(0)).to.be.instanceof(ObjectElement);
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

    it('produces samples from examples', () => {
      const schema = {
        type: 'array',
        examples: [
          ['Doe'],
        ],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.get(0)).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.be.deep.equal([['Doe']]);
    });

    it('produces samples from example', () => {
      const schema = {
        type: 'array',
        example: ['Doe'],
      };

      const dataStructure = schemaToDataStructure(schema);

      expect(dataStructure.element).to.equal('dataStructure');
      expect(dataStructure.content).to.be.instanceof(ArrayElement);

      const samples = dataStructure.content.attributes.get('samples');
      expect(samples).to.be.instanceof(ArrayElement);
      expect(samples.get(0)).to.be.instanceof(ArrayElement);
      expect(samples.toValue()).to.be.deep.equal([['Doe']]);
    });
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
    expect(enumerations.getValue(0)).to.equal('one');
    expect(enumerations.get(1)).to.be.instanceof(NumberElement);
    expect(enumerations.getValue(1)).to.equal(2);
    expect(enumerations.get(2)).to.be.instanceof(NullElement);
  });

  it('produces samples for enum element', () => {
    const schema = {
      enum: ['one', 'two'],
      examples: ['one', 'two'],
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

    const samples = dataStructure.content.attributes.get('samples');

    expect(samples.length).to.equal(2);
    expect(samples.get(0)).to.be.instanceof(EnumElement);
    expect(samples.get(0).toValue()).to.be.deep.equal('one');
    expect(samples.get(1)).to.be.instanceof(EnumElement);
    expect(samples.get(1).toValue()).to.be.deep.equal('two');
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
});
