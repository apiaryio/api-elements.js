const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../../lib/parser/oas/parseSchemaObject');

const { minim } = new Fury();

describe('Schema Object', () => {
  it('provides a warning when schema is non-object', () => {
    const schema = new minim.elements.Member('User', 'my schema');
    const result = parse(minim, schema);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'Schema Object' is not an object");
  });

  describe('#type', () => {
    it('returns an object structure for object type', () => {
      const schema = new minim.elements.Member('User', {
        type: 'object',
      });
      const result = parse(minim, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.DataStructure);

      const object = result.get(0).content;
      expect(object).to.be.instanceof(minim.elements.Object);
      expect(object.id.toValue()).to.equal('User');
    });

    it('returns an array structure for array type', () => {
      const schema = new minim.elements.Member('Users', {
        type: 'array',
      });
      const result = parse(minim, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.DataStructure);

      const array = result.get(0).content;
      expect(array).to.be.instanceof(minim.elements.Array);
      expect(array.id.toValue()).to.equal('Users');
    });

    it('returns a string structure for string type', () => {
      const schema = new minim.elements.Member('name', {
        type: 'string',
      });
      const result = parse(minim, schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.DataStructure);

      const string = result.get(0).content;
      expect(string).to.be.instanceof(minim.elements.String);
      expect(string.id.toValue()).to.equal('name');
    });
  });
});
