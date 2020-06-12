const R = require('ramda');
const { Fury } = require('@apielements/core');
const { expect } = require('../chai');
const parseObject = require('../../../lib/parser/parseObject');

const { minim: namespace } = new Fury();
const Context = require('../../../lib/context');

describe('#parseObject', () => {
  let name;
  let context;
  let object;

  beforeEach(() => {
    name = 'Example Object';
    context = new Context(namespace);
    object = new namespace.elements.Object({
      name: 'Doe',
      message: 'Hello',
    });
  });

  it('provides warning when given element is non-object', () => {
    const element = new namespace.elements.String();

    const parseMember = member => member;
    const parseResult = parseObject(context, name, parseMember)(element);

    expect(parseResult).to.contain.warning("'Example Object' is not an object");
  });

  it('can parse an object when the transform returns a member element', () => {
    const parseMember = member => member;
    const parseResult = parseObject(context, name, parseMember)(object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a value to be wrapped in a member', () => {
    const parseMember = member => member.value;
    const parseResult = parseObject(context, name, parseMember)(object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a parse result', () => {
    const parseMember = member => new namespace.elements.ParseResult([member]);
    const parseResult = parseObject(context, name, parseMember)(object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a parse result containing a value to be wrapped in a member', () => {
    const parseMember = member => new namespace.elements.ParseResult([member.value]);
    const parseResult = parseObject(context, name, parseMember)(object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a parse result including a warning annotation', () => {
    const parseMember = (member) => {
      const warning = new namespace.elements.Annotation(
        `${member.key.toValue()} warning`,
        { classes: ['warning'] }
      );
      return new namespace.elements.ParseResult([member, warning]);
    };
    const parseResult = parseObject(context, name, parseMember)(object);

    expect(parseResult.length).to.equal(3);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');

    expect(parseResult.warnings.length).to.equal(2);
    expect(parseResult.warnings.get(0).toValue()).to.equal('name warning');
    expect(parseResult.warnings.get(1).toValue()).to.equal('message warning');
  });

  it('discards any members when the transform returns a parse result which includes an error', () => {
    const parseMember = (member) => {
      const warning = new namespace.elements.Annotation(
        `${member.key.toValue()} error`,
        { classes: ['error'] }
      );
      return new namespace.elements.ParseResult([member, warning]);
    };
    const parseResult = parseObject(context, name, parseMember)(object);

    expect(parseResult.length).to.equal(2);
    expect(parseResult.errors.get(0).toValue()).to.equal('name error');
    expect(parseResult.errors.get(1).toValue()).to.equal('message error');
  });

  it('discards any members when the transform returns a parse result which includes a warning and no value', () => {
    const parseMember = (member) => {
      const warning = new namespace.elements.Annotation(
        `${member.key.toValue()} warning`,
        { classes: ['warning'] }
      );
      return new namespace.elements.ParseResult([warning]);
    };
    const parseResult = parseObject(context, name, parseMember)(object);

    expect(parseResult.length).to.equal(3);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);
    expect(parseResult.get(0).isEmpty).to.be.true;

    expect(parseResult.warnings.get(0).toValue()).to.equal('name warning');
    expect(parseResult.warnings.get(1).toValue()).to.equal('message warning');
  });

  describe('required keys', () => {
    it('validates that the object contains any required keys', () => {
      const parseResult = parseObject(context, name, R.T, ['name', 'required1', 'required2'])(object);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.errors.toValue()).to.deep.equal([
        "'Example Object' is missing required property 'required1'",
        "'Example Object' is missing required property 'required2'",
      ]);
    });

    it('fails object parsing when member parse cannot parse required key', () => {
      const parseMember = (member) => {
        const warning = new namespace.elements.Annotation(
          `${member.key.toValue()} warning`,
          { classes: ['warning'] }
        );
        return new namespace.elements.ParseResult([warning]);
      };
      const parseResult = parseObject(context, name, parseMember, ['name'])(object);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.annotations.toValue()).to.deep.equal([
        'name warning',
        'message warning',
      ]);
    });

    it('can parse object with required keys', () => {
      const parseResult = parseObject(context, name, R.T, ['name'])(object);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);
    });
  });
});
