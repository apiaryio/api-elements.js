const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseSchemaObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Schema Object', () => {
  it('provides a warning when schema is non-object', () => {
    const schema = new namespace.elements.Member('User', 'my schema');
    const result = parse(new Context(namespace), schema);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Schema Object' is not an object");
  });

  describe('#type', () => {
    it('returns an object structure for object type', () => {
      const schema = new namespace.elements.Member('User', {
        type: 'object',
      });
      const result = parse(new Context(namespace), schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const object = result.get(0).content;
      expect(object).to.be.instanceof(namespace.elements.Object);
      expect(object.id.toValue()).to.equal('User');
    });

    it('returns an array structure for array type', () => {
      const schema = new namespace.elements.Member('Users', {
        type: 'array',
      });
      const result = parse(new Context(namespace), schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const array = result.get(0).content;
      expect(array).to.be.instanceof(namespace.elements.Array);
      expect(array.id.toValue()).to.equal('Users');
    });

    it('returns a string structure for string type', () => {
      const schema = new namespace.elements.Member('name', {
        type: 'string',
      });
      const result = parse(new Context(namespace), schema);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.DataStructure);
      expect(result).to.not.contain.annotations;

      const string = result.get(0).content;
      expect(string).to.be.instanceof(namespace.elements.String);
      expect(string.id.toValue()).to.equal('name');
    });
  });
});
