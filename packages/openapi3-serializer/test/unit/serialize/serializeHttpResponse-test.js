const { expect } = require('chai');
const { Fury } = require('fury');

const serializeHttpResponse = require('../../../lib/serialize/serializeHttpResponse');

const namespace = new Fury().minim;

describe('#serializeHttpResponse', () => {
  it('serializes empty response', () => {
    const response = new namespace.elements.HttpResponse();

    const operation = serializeHttpResponse(response);
    expect(operation).to.deep.equal({
      description: 'Unknown',
    });
  });
});
