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

  describe('using serialize', () => {
    it('can serialize a primitive element', (done) => {
      const element = new fury.minim.elements.String('hello world');

      fury.serialize({ api: element, mediaType: 'text/plain' }, (error, result) => {
        expect(error).to.be.null;
        expect(result).to.equal('hello world');
        done();
      });
    });

    it('errors with a non-primitive element', (done) => {
      const element = new fury.minim.elements.Object({ message: 'Hello world' });

      fury.serialize({ api: element, mediaType: 'text/plain' }, (error, result) => {
        expect(error.message).to.equal('Only primitive elements can be serialized as text/plain');
        expect(result).to.be.undefined;
        done();
      });
    });
  });

  describe('using serializeSync', () => {
    it('can serialize a primitive element', () => {
      const element = new fury.minim.elements.String('hello world');
      const result = fury.serializeSync({ api: element, mediaType: 'text/plain' });

      expect(result).to.equal('hello world');
    });

    it('errors with a non-primitive element', () => {
      const element = new fury.minim.elements.Object({ message: 'Hello world' });

      expect(() => fury.serializeSync({ api: element, mediaType: 'text/plain' }))
        .to.throw('Only primitive elements can be serialized as text/plain');
    });
  });
});
