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

    it('serializes API resources with copy', () => {
      const api = new namespace.elements.Category([], { classes: ['api'] });
      api.push(new namespace.elements.Copy('Hello World'));
      api.push(new namespace.elements.Copy('Another Copy'));

      const document = serializeApi(api);
      expect(document.info.description).to.equal('Hello World\n\nAnother Copy');
    });
  });

  describe('Paths Object', () => {
    it('serializes resource in paths', () => {
      const resource = new namespace.elements.Resource();
      resource.href = '/users';

      const api = new namespace.elements.Category([resource], { classes: ['api'] });

      const document = serializeApi(api);
      expect(document.paths).to.deep.equal({
        '/users': {},
      });
    });

    it('serializes resource inside resource group in paths', () => {
      const resource = new namespace.elements.Resource();
      resource.href = '/users';

      const resourceGroup = new namespace.elements.Category([resource], { classes: ['resourceGroup'] });

      const api = new namespace.elements.Category([resourceGroup], { classes: ['api'] });

      const document = serializeApi(api);
      expect(document.paths).to.deep.equal({
        '/users': {},
      });
    });

    it('serializes resource with URI Template in paths', () => {
      const resource = new namespace.elements.Resource();
      resource.href = '/users/{username}{/segments}{?filter,tags*}{&foo}';

      const api = new namespace.elements.Category([resource], { classes: ['api'] });

      const document = serializeApi(api);
      expect(document.paths).to.deep.equal({
        '/users/{username}': {},
      });
    });
  });
});
