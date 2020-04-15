const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseServerVariableObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseServerVariableObject', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when server variable is non-object', () => {
    const serverVariable = new namespace.elements.String();

    const parseResult = parse(context)(serverVariable);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Server Variable Object' is not an object");
  });

  describe('#default', () => {
    it('warns when server variable object does not contain the default value', () => {
      const serverVariable = new namespace.elements.Object({
      });

      const parseResult = parse(context)(serverVariable);
      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Server Variable Object' is missing required property 'default'");
    });

    it('warns when default is not a string', () => {
      const serverVariable = new namespace.elements.Object({
        default: 1234,
        description: 'API user name',
      });

      const parseResult = parse(context)(serverVariable);
      expect(parseResult).to.contain.error("'Server Variable Object' 'default' is not a string");
    });

    it('parse server variable object with default value', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
      });

      const parseResult = parse(context)(serverVariable);
      expect(parseResult).to.not.contain.annotations;

      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.String);
      expect(member.default).to.be.equal('Mario');
    });
  });

  describe('#description', () => {
    it('warns when description is not a string', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        description: 1234,
      });

      const parseResult = parse(context)(serverVariable);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.String);
      expect(parseResult).to.contain.warning("'Server Variable Object' 'description' is not a string");
    });

    it('parse server variable object with description', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        description: 'API user name',
      });

      const parseResult = parse(context)(serverVariable);
      expect(parseResult).to.not.contain.annotations;

      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.String);

      const description = member.description.toValue();
      expect(description).to.be.equal('API user name');
    });
  });

  describe('#enum', () => {
    it('warns when enum is not an array', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        enum: 1,
      });
      const parseResult = parse(context)(serverVariable);

      expect(parseResult).to.contain.warning(
        "'Server Variable Object' 'enum' is not an array"
      );
    });

    it('parse server variable object with enum', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        enum: [['Tony', 'Nina']],
      });

      const parseResult = parse(context)(serverVariable);
      expect(parseResult).to.not.contain.annotations;

      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.String);

      const enumElement = member.enum;
      expect(enumElement).to.be.instanceof(namespace.elements.Enum);
      expect(enumElement.enumerations.length).to.equal(1);

      const enumeration = enumElement.enumerations.get(0);
      expect(enumeration).to.be.instanceof(namespace.elements.Array);
      expect(enumeration.toValue()).to.deep.equal(['Tony', 'Nina']);
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });
  });
});
