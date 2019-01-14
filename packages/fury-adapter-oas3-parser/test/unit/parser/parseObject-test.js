const { Fury } = require('fury');
const { expect } = require('../chai');
const parseObject = require('../../../lib/parser/parseObject');

const { minim: namespace } = new Fury();
const Context = require('../../../lib/context');

describe('#parseObject', () => {
  const object = new namespace.elements.Object({
    name: 'Doe',
    message: 'Hello',
  });

  it('can parse an object when the transform returns a member element', () => {
    const context = new Context(namespace, { generateSourceMap: true });

    const parseMember = member => member;
    const parseResult = parseObject(context, parseMember, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a value to be wrapped in a member', () => {
    const context = new Context(namespace, { generateSourceMap: true });

    const parseMember = member => member.value;
    const parseResult = parseObject(context, parseMember, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a parse result', () => {
    const context = new Context(namespace, { generateSourceMap: true });

    const object = new namespace.elements.Object({
      name: 'Doe',
      message: 'Hello',
    });

    const parseMember = member => new namespace.elements.ParseResult([member]);
    const parseResult = parseObject(context, parseMember, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a parse result containing a value to be wrapped in a member', () => {
    const context = new Context(namespace, { generateSourceMap: true });

    const parseMember = member => new namespace.elements.ParseResult([member.value]);
    const parseResult = parseObject(context, parseMember, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

    expect(parseResult.get(0).length).to.equal(2);
    expect(parseResult.get(0).get('name').toValue()).to.equal('Doe');
    expect(parseResult.get(0).get('message').toValue()).to.equal('Hello');
  });

  it('can parse an object when the transform returns a parse result including a warning annotation', () => {
    const context = new Context(namespace, { generateSourceMap: true });

    const parseMember = (member) => {
      const warning = new namespace.elements.Annotation(
        `${member.key.toValue()} warning`,
        { classes: ['warning'] }
      );
      return new namespace.elements.ParseResult([member, warning]);
    };
    const parseResult = parseObject(context, parseMember, object);

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
    const context = new Context(namespace, { generateSourceMap: true });

    const parseMember = (member) => {
      const warning = new namespace.elements.Annotation(
        `${member.key.toValue()} error`,
        { classes: ['error'] }
      );
      return new namespace.elements.ParseResult([member, warning]);
    };
    const parseResult = parseObject(context, parseMember, object);

    expect(parseResult.length).to.equal(2);
    expect(parseResult.errors.get(0).toValue()).to.equal('name error');
    expect(parseResult.errors.get(1).toValue()).to.equal('message error');
  });

  it('discards any members when the transform returns a parse result which includes a warning and no value', () => {
    const context = new Context(namespace, { generateSourceMap: true });

    const parseMember = (member) => {
      const warning = new namespace.elements.Annotation(
        `${member.key.toValue()} warning`,
        { classes: ['warning'] }
      );
      return new namespace.elements.ParseResult([warning]);
    };
    const parseResult = parseObject(context, parseMember, object);

    expect(parseResult.length).to.equal(3);
    expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);
    expect(parseResult.get(0).isEmpty).to.be.true;

    expect(parseResult.warnings.get(0).toValue()).to.equal('name warning');
    expect(parseResult.warnings.get(1).toValue()).to.equal('message warning');
  });
});
