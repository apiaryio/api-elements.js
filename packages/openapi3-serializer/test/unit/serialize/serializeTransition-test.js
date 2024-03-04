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

  it('serializes transition with http response', () => {
    const response = new namespace.elements.HttpResponse();
    response.statusCode = 200;

    const transaction = new namespace.elements.HttpTransaction([response]);
    const transition = new namespace.elements.Transition([transaction]);

    const operation = serializeTransition(transition);
    expect(operation).to.deep.equal({
      responses: {
        200: {
          description: 'Unknown',
        },
      },
    });
  });
});
