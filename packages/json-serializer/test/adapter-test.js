const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const adapter = require('../lib/adapter');

describe('JSON Serialiser Adapter', () => {
  let fury;

  before(() => {
    fury = new Fury();
    fury.use(adapter);
  });

  it('has a name', () => {
    expect(adapter.name).to.equal('json');
  });

  it('has a JSON media type', () => {
    expect(adapter.mediaTypes).to.deep.equal(['application/json']);
  });

  it('can serialize an element asynchronously', (done) => {
    const element = new fury.minim.elements.String('hello world');

    fury.serialize({ api: element, mediaType: 'application/json' }, (error, result) => {
      expect(error).to.be.null;
      expect(result).to.equal('"hello world"');
      done();
    });
  });

  it('can serialize an element synchronously', () => {
    const element = new fury.minim.elements.String('hello world');
    const result = fury.serializeSync({ api: element, mediaType: 'application/json' });

    expect(result).to.equal('"hello world"');
  });
});
