const { expect } = require('chai');
const { Fury } = require('fury');

const adapter = require('../../lib/adapter');

const fury = new Fury();
fury.use(adapter);

describe('Adapter', () => {
  it('has a name', () => {
    expect(adapter.name).to.equal('openapi3');
  });

  it('has OpenAPI media types', () => {
    expect(adapter.mediaTypes).to.deep.equal([
      'application/vnd.oai.openapi',
      'application/vnd.oai.openapi+json',
    ]);
  });

  it('serializes an API Element to OpenAPI 3 as YAML', (done) => {
    const api = new fury.minim.elements.Category([], { classes: ['api'] });
    api.title = 'Polls API';
    api.attributes.set('version', '2.0.0');

    fury.serialize({ api, mediaType: 'application/vnd.oai.openapi' }, (err, result) => {
      expect(err).to.be.null;
      expect(result).to.equal('openapi: 3.0.3\ninfo:\n  title: Polls API\n  version: 2.0.0\npaths: {}\n');
      done();
    });
  });

  it('serializes an API Element to OpenAPI 3 as JSON', (done) => {
    const api = new fury.minim.elements.Category([], { classes: ['api'] });
    api.title = 'Polls API';
    api.attributes.set('version', '2.0.0');

    fury.serialize({ api, mediaType: 'application/vnd.oai.openapi+json' }, (err, result) => {
      expect(err).to.be.null;
      expect(result).to.equal('{"openapi":"3.0.3","info":{"title":"Polls API","version":"2.0.0"},"paths":{}}');
      done();
    });
  });
});
