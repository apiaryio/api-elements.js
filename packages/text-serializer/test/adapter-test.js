const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const adapter = require('../lib/adapter');

describe('Text Serializer Adapter', () => {
  let fury;

  before(() => {
    fury = new Fury();
    fury.use(adapter);
  });

  it('has a name', () => {
    expect(adapter.name).to.equal('text');
  });

  it('has a text/plain media type', () => {
    expect(adapter.mediaTypes).to.deep.equal(['text/plain']);
  });

  it('can serialize an element asynchronously', (done) => {
    const element = new fury.minim.elements.String('hello world');

    fury.serialize({ api: element, mediaType: 'text/plain' }, (error, result) => {
      expect(error).to.be.null;
      expect(result).to.equal('hello world');
      done();
    });
  });

  it('can serialize an element synchronously', () => {
    const element = new fury.minim.elements.String('hello world');
    const result = fury.serializeSync({ api: element, mediaType: 'text/plain' });

    expect(result).to.equal('hello world');
  });
});
