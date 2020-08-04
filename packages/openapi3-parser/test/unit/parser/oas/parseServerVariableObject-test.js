const { Fury } = require('@apielements/core');
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

    const parseResult = parse(context)(serverVariable, 'name');

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Server Variable Object' is not an object");
  });

  describe('#default', () => {
    it('warns when server variable object does not contain the default value', () => {
      const serverVariable = new namespace.elements.Object({
      });

      const parseResult = parse(context)(serverVariable, 'name');
      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Server Variable Object' is missing required property 'default'");
    });

    it('warns when default is not a string', () => {
      const serverVariable = new namespace.elements.Object({
        default: 1234,
        description: 'API user name',
      });

      const parseResult = parse(context)(serverVariable, 'name');
      expect(parseResult).to.contain.error("'Server Variable Object' 'default' is not a string");
    });

    it('parse server variable object with default value', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
      });

      const parseResult = parse(context)(serverVariable, 'name');
      expect(parseResult).to.not.contain.annotations;

      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.String);
      expect(member.value.attributes.get('default').toValue()).to.be.equal('Mario');
    });
  });

  describe('#description', () => {
    it('warns when description is not a string', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        description: 1234,
      });

      const parseResult = parse(context)(serverVariable, 'name');
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Member);
      expect(parseResult.get(0).value).to.be.instanceof(namespace.elements.String);
      expect(parseResult.get(1)).to.be.instanceof(namespace.elements.Annotation);
      expect(parseResult).to.contain.warning("'Server Variable Object' 'description' is not a string");
    });

    it('attaches description to member', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        description: 'API user name',
      });

      const parseResult = parse(context)(serverVariable, 'name');
      expect(parseResult).to.not.contain.annotations;

      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);

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
      const parseResult = parse(context)(serverVariable, 'name');

      expect(parseResult).to.contain.warning(
        "'Server Variable Object' 'enum' is not an array"
      );
    });

    it('parse server variable object with enum', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        enum: ['Tony', 'Nina'],
      });

      const parseResult = parse(context)(serverVariable, 'name');
      expect(parseResult).to.not.contain.annotations;

      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Enum);

      const { enumerations } = member.value;
      expect(enumerations).to.be.instanceof(namespace.elements.Array);
      expect(enumerations.length).to.equal(2);
      expect(enumerations.toValue()).to.deep.equal(['Tony', 'Nina']);

      const enumeration = enumerations.get(0);
      expect(enumeration.toValue()).to.deep.equal('Tony');
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });

    it('parse server variable object with enum containing non-string', () => {
      const serverVariable = new namespace.elements.Object({
        default: 'Mario',
        enum: ['Tony', 1, 'Nina', true],
      });

      const parseResult = parse(context)(serverVariable, 'name');
      expect(parseResult).to.contain.annotations;

      const { annotations } = parseResult;
      expect(annotations.length).to.equal(2);
      expect(annotations.get(0).toValue()).to.deep.equal("'Server Variable Object' 'enum' array value is not a string");

      const member = parseResult.get(0);
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.instanceof(namespace.elements.Enum);

      const { enumerations } = member.value;
      expect(enumerations).to.be.instanceof(namespace.elements.Array);
      expect(enumerations.length).to.equal(2);
      expect(enumerations.toValue()).to.deep.equal(['Tony', 'Nina']);

      const enumeration = enumerations.get(0);
      expect(enumeration.toValue()).to.deep.equal('Tony');
      expect(enumeration.attributes.getValue('typeAttributes')).to.deep.equal(['fixed']);
    });
  });
});
