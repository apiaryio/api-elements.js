const { expect } = require('chai');
const { Fury } = require('../lib/fury');
const assert = require('./assert');

describe('Serialize', () => {
  describe('using callback', () => {
    it('errors with unknown mediaType', (done) => {
      const fury = new Fury();
      const api = new fury.minim.elements.Category();

      fury.serialize({ api, mediaType: 'application/unregistered' }, (error, result) => {
        expect(error.message).to.equal('Media type did not match any registered serializer!');
        expect(result).to.be.undefined;
        done();
      });
    });

    it('errors with matching erroring adapter', (done) => {
      const fury = new Fury();
      fury.use({
        name: 'json',
        mediaTypes: ['application/json'],
        serialize: () => Promise.reject(new Error('failed to serialize')),
      });

      const api = new fury.minim.elements.Category();

      fury.serialize({ api, mediaType: 'application/json' }, (error, result) => {
        expect(error.message).to.equal('failed to serialize');
        expect(result).to.be.undefined;
        done();
      });
    });

    it('can serialize with matching adapter', (done) => {
      const fury = new Fury();
      fury.use({
        name: 'json',
        mediaTypes: ['application/json'],
        serialize: ({ api, namespace }) => Promise.resolve(JSON.stringify(namespace.serialiser.serialise(api))),
      });

      const api = new fury.minim.elements.Category();

      fury.serialize({ api, mediaType: 'application/json' }, (error, result) => {
        expect(error).to.be.null;
        expect(result).to.equal('{"element":"category"}');
        done();
      });
    });
  });

  describe('using async/await', () => {
    it('errors with unknown mediaType', async () => {
      const fury = new Fury();
      const api = new fury.minim.elements.Category();

      await assert.rejects(
        async () => {
          await fury.serialize({ api, mediaType: 'application/unregistered' });
        },
        'Media type did not match any registered serializer!'
      );
    });

    it('errors with matching erroring adapter', async () => {
      const fury = new Fury();
      fury.use({
        name: 'json',
        mediaTypes: ['application/json'],
        serialize: () => Promise.reject(new Error('failed to serialize')),
      });

      const api = new fury.minim.elements.Category();

      await assert.rejects(
        async () => {
          await fury.serialize({ api, mediaType: 'application/json' });
        },
        'failed to serialize'
      );
    });

    it('can serialize with matching adapter', async () => {
      const fury = new Fury();
      fury.use({
        name: 'json',
        mediaTypes: ['application/json'],
        serialize: ({ api, namespace }) => Promise.resolve(JSON.stringify(namespace.serialiser.serialise(api))),
      });

      const api = new fury.minim.elements.Category();

      const result = await fury.serialize({ api, mediaType: 'application/json' });
      expect(result).to.equal('{"element":"category"}');
    });
  });
});
