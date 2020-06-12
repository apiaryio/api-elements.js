const R = require('ramda');
const { Fury } = require('@apielements/core');
const { expect } = require('../chai');

const parseMap = require('../../../lib/parser/parseMap');

const { minim: namespace } = new Fury();
const Context = require('../../../lib/context');

const pipeParseResult = require('../../../lib/pipeParseResult');
const { createWarning } = require('../../../lib/parser/annotations');

function parseDummy(context, object) {
  const { namespace } = context;

  return pipeParseResult(namespace,
    R.unless(element => element.element === 'object', createWarning(namespace, 'dummy warning')),
    () => new namespace.elements.String('dummy'))(object);
}

describe('#parseMap', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('will report if map is not object', () => {
    const member = new context.namespace.elements.Member('key', 'value');

    const result = parseMap(context, 'dummy', 'key', parseDummy)(member);

    expect(result).to.contain.warning("'dummy' 'key' is not an object");
  });

  it('can parse empty map', () => {
    const member = new context.namespace.elements.Member('key', {});

    const result = parseMap(context, 'dummy', 'key', parseDummy)(member);

    expect(result).to.not.contain.annotations;
  });

  it('invoke parser to map values', () => {
    const member = new context.namespace.elements.Member('key', {
      uno: {},
      dos: {},
    });

    const result = parseMap(context, 'dummy', 'key', parseDummy)(member);

    expect(result).to.not.contain.annotations;
    expect(result.length).to.be.equal(1);

    const members = result.get(0);

    expect(members.length).to.be.equal(2);

    const member1 = members.content[0];
    expect(member1).to.be.instanceof(context.namespace.elements.Member);
    expect(member1.key.toValue()).to.be.equal('uno');
    expect(member1.value).to.be.instanceof(context.namespace.elements.String);
    expect(member1.value.toValue()).to.be.equal('dummy');

    const member2 = members.content[1];
    expect(member2).to.be.instanceof(context.namespace.elements.Member);
    expect(member2.key.toValue()).to.be.equal('dos');
    expect(member2.value).to.be.instanceof(context.namespace.elements.String);
    expect(member2.value.toValue()).to.be.equal('dummy');
  });

  it('propagate annotations from parser', () => {
    const member = new context.namespace.elements.Member('key', {
      uno: {},
      dos: 'bad type',
    });

    const result = parseMap(context, 'dummy', 'key', parseDummy)(member);

    expect(result).to.contain.warning('dummy warning');
    expect(result.length).to.be.equal(2);

    const members = result.get(0);

    expect(members.length).to.be.equal(2);

    const member1 = members.content[0];
    expect(member1).to.be.instanceof(context.namespace.elements.Member);
    expect(member1.key.toValue()).to.be.equal('uno');
    expect(member1.value).to.be.instanceof(context.namespace.elements.String);
    expect(member1.value.toValue()).to.be.equal('dummy');

    const member2 = members.content[1];
    expect(member2).to.be.instanceof(context.namespace.elements.Member);
    expect(member2.key.toValue()).to.be.equal('dos');
    expect(member2.value).to.be.undefined;
  });
});
