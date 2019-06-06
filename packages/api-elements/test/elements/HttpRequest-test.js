const assert = require('assert');
const { Namespace } = require('../../lib/api-elements');

const namespace = new Namespace();

describe('HttpRequest', () => {
  const { HttpRequest } = namespace.elements;

  describe('#method', () => {
    it('can access method attribute via property', () => {
      const request = new HttpRequest();
      request.attributes.set('method', 'GET');

      assert(request.method instanceof namespace.elements.String);
      assert.equal(request.method.toValue(), 'GET');
    });

    it('can set method attribute via property', () => {
      const request = new HttpRequest();

      request.method = 'GET';

      const method = request.attributes.get('method');
      assert(method instanceof namespace.elements.String);
      assert.equal(method.toValue(), 'GET');
    });
  });

  describe('#href', () => {
    it('can access href attribute via property', () => {
      const request = new HttpRequest();
      request.attributes.set('href', '/');

      assert(request.href instanceof namespace.elements.String);
      assert.equal(request.href.toValue(), '/');
    });

    it('can set href attribute via property', () => {
      const request = new HttpRequest();

      request.href = '/';

      const method = request.attributes.get('href');
      assert(method instanceof namespace.elements.String);
      assert.equal(method.toValue(), '/');
    });
  });

  describe('#hrefVariables', () => {
    it('can access hrefVariables attribute via property', () => {
      const request = new HttpRequest();
      request.attributes.set('hrefVariables', {
        limit: 5,
      });

      assert(request.hrefVariables instanceof namespace.elements.Object);
      assert.deepEqual(request.hrefVariables.valueOf(), {
        limit: 5,
      });
    });

    it('can set href attribute via property', () => {
      const request = new HttpRequest();

      request.hrefVariables = {
        limit: 5,
      };

      const hrefVariables = request.attributes.get('hrefVariables');
      assert(hrefVariables instanceof namespace.elements.Object);
      assert.deepEqual(hrefVariables.valueOf(), {
        limit: 5,
      });
    });
  });
});
