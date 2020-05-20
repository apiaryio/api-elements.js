const { expect } = require('chai');
const { Fury } = require('fury');

const serializeApi = require('../../../lib/serialize/serializeApi');

const namespace = new Fury().minim;

describe('#serializeApi', () => {
  it('serializes empty API resources', () => {
    const api = new namespace.elements.Category([], { classes: ['api'] });

    const document = serializeApi(api);

    expect(document).to.deep.equal({
      openapi: '3.0.3',
      info: {
        title: 'API',
        version: 'Unknown',
      },
      paths: {},
    });
  });

  describe('Info Object', () => {
    it('serializes API resources with title', () => {
      const api = new namespace.elements.Category([], { classes: ['api'] });
      api.title = 'Polls API';

      const document = serializeApi(api);
      expect(document.info.title).to.equal('Polls API');
    });

    it('serializes API resources with version', () => {
      const api = new namespace.elements.Category([], { classes: ['api'] });
      api.attributes.set('version', '1.0.0');

      const document = serializeApi(api);
      expect(document.info.version).to.equal('1.0.0');
    });
  });
});
