const { expect } = require('chai');
const { Fury } = require('fury');

const serializeTransition = require('../../../lib/serialize/serializeTransition');

const namespace = new Fury().minim;

describe('#serializeTransition', () => {
  it('serializes empty transition', () => {
    const transition = new namespace.elements.Transition();

    const operation = serializeTransition(transition);
    expect(operation).to.deep.equal({
      responses: {},
    });
  });
});
