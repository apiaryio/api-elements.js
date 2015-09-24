/*
 * Tests for API description namespace elements, including all their
 * convenience properties and methods.
 */

import chai, {Assertion, expect} from 'chai';

import minim from 'minim';
import apiDescription from '../src/api-description';

const namespace = minim.namespace().use(apiDescription);

const Category = namespace.getElementClass('category');
const Copy = namespace.getElementClass('copy');
const Resource = namespace.getElementClass('resource');
const Transition = namespace.getElementClass('transition');
const HttpTransaction = namespace.getElementClass('httpTransaction');
const HttpRequest = namespace.getElementClass('httpRequest');
const HttpResponse = namespace.getElementClass('httpResponse');
const Asset = namespace.getElementClass('asset');
const DataStructure = namespace.getElementClass('dataStructure');

// Hmm, this might not be the best way to do this... ideas?
const HttpMessagePayload = Object.getPrototypeOf(HttpRequest);

chai.use((_chai, utils) => {
  /*
   * Asserts that an element has a certain class.
   */
  utils.addMethod(Assertion.prototype, 'class', function hasClass(name) {
    const obj = this._obj;
    this.assert(
      obj.classes.contains(name),
      'Expected class list #{act} to contain #{exp}',
      'Expected class list #{act} to not contain #{exp}',
      name,
      obj.classes.toValue()
    );
  });
});

/*
 * Shortcut to get an attribute value from an element.
 */
function attrValue(element, name) {
  return element.attributes.getValue(name);
}

describe('API description namespace', () => {
  context('category element', () => {
    let category;

    beforeEach(() => {
      category = (new Category()).fromCompactRefract([
        'category', {classes: ['api']}, {meta: ['array', {}, {}, [
          ['member', {classes: ['user']}, {}, {
            key: ['string', {}, {}, 'HOST'],
            value: ['string', {}, {}, 'https://example.com'],
          }]],
        ]}, [
          ['category', {classes: ['resourceGroup']}, {}, []],
          ['category', {classes: ['dataStructures']}, {}, []],
          ['category', {classes: ['scenario']}, {}, []],
          ['category', {classes: ['transitions']}, {}, []],
          ['resource', {}, {}, []],
          ['transition', {}, {}, []],
          ['copy', {}, {}, ''],
        ],
      ]);
    });

    it('should have element name category', () => {
      expect(category.element).to.equal('category');
    });

    it('should have host metadata', () => {
      const meta = category.attributes.get('meta').first();
      expect(meta.key.toValue()).to.equal('HOST');
      expect(meta.value.toValue()).to.equal('https://example.com');
    });

    it('should contain a resource group', () => {
      const items = category.resourceGroups;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Category);
        expect(item).to.have.class('resourceGroup');
      });
    });

    it('should contain a data structure', () => {
      const items = category.dataStructures;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Category);
        expect(item).to.have.class('dataStructures');
      });
    });

    it('should contain a scenario', () => {
      const items = category.scenarios;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Category);
        expect(item).to.have.class('scenario');
      });
    });

    it('should contain a transition group', () => {
      const items = category.transitionGroups;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Category);
        expect(item).to.have.class('transitions');
      });
    });

    it('should contain a resource', () => {
      const items = category.resources;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Resource);
      });
    });

    it('should contain a transition', () => {
      const items = category.transitions;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Transition);
      });
    });

    it('should contain a copy element', () => {
      const items = category.copy;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Copy);
      });
    });
  });

  context('copy element', () => {
    let copy;

    beforeEach(() => {
      copy = (new Copy()).fromCompactRefract(
        ['copy', {}, {contentType: 'text/html'}, 'I am some text']
      );
    });

    it('should have element name copy', () => {
      expect(copy.element).to.equal('copy');
    });

    it('should have a content type', () => {
      expect(copy.contentType).to.equal('text/html');
    });

    it('should set a content type', () => {
      copy.contentType = 'text/plain';
      expect(attrValue(copy, 'contentType')).to.equal('text/plain');
    });

    it('should contain some text', () => {
      expect(copy.content).to.equal('I am some text');
    });
  });

  context('data structure element', () => {
    let struct;

    beforeEach(() => {
      struct = new DataStructure('test');
    });

    it('should have element name dataStructure', () => {
      expect(struct.element).to.equal('dataStructure');
    });

    it('should have element content', () => {
      expect(struct.content).to.be.an.instanceof(namespace.BaseElement);
    });

    it('should get element content value', () => {
      expect(struct.toValue()).to.equal('test');
    });

    it('should serialize to refract', () => {
      const refract = struct.toRefract();
      expect(refract).to.deep.equal({
        element: 'dataStructure',
        meta: {},
        attributes: {},
        content: {
          element: 'string',
          meta: {},
          attributes: {},
          content: 'test',
        },
      });
    });

    it('should serialize to compact refract', () => {
      const refract = struct.toCompactRefract();
      expect(refract).to.deep.equal(
        ['dataStructure', {}, {},
          ['string', {}, {}, 'test'],
        ]
      );
    });

    it('should load from refract', () => {
      const refract = struct.toRefract();
      const loaded = (new DataStructure()).fromRefract(refract);
      expect(loaded.toRefract()).to.deep.equal(refract);
    });

    it('should load from compact refract', () => {
      const refract = struct.toCompactRefract();
      const loaded = (new DataStructure()).fromCompactRefract(refract);
      expect(loaded.toCompactRefract()).to.deep.equal(refract);
    });
  });

  context('resource element', () => {
    let resource;

    beforeEach(() => {
      resource = (new Resource()).fromCompactRefract(
        ['resource', {}, {
          href: '/resource/{id}',
          hrefVariables: ['hrefVariables', {}, {}, [
            ['member', {}, {}, {
              key: ['string', {}, {}, 'id'],
              value: ['string', {}, {}, '123'],
            }],
          ]],
        }, [
          ['transition', {}, {}, []],
          ['dataStructure', {}, {}, []],
        ]]
      );
    });

    it('should have element name resource', () => {
      expect(resource.element).to.equal('resource');
    });

    it('should have an href', () => {
      expect(resource.href).to.equal('/resource/{id}');
    });

    it('should set an href', () => {
      resource.href = '/foo/{id}';
      expect(attrValue(resource, 'href')).to.equal('/foo/{id}');
    });

    it('should have hrefVariables', () => {
      expect(resource.hrefVariables.toValue()).to.deep.equal({
        id: '123',
      });
    });

    it('should set hrefVariables', () => {
      resource.hrefVariables = {
        id: '456',
      };
      expect(attrValue(resource, 'hrefVariables')).to.deep.equal({
        id: '456',
      });
    });

    it('should contain a transition', () => {
      const items = resource.transitions;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Transition);
      });
    });

    it('should contain a data structure', () => {
      expect(resource.dataStructure).to.be.an.instanceof(DataStructure);
    });
  });

  context('transition element', () => {
    let transition;

    beforeEach(() => {
      transition = (new Transition()).fromCompactRefract(
        ['transition', {}, {
          relation: 'action',
          href: '/resource',
          data: ['dataStructure', {}, {}, ['object', {}, {}, null]],
          contentTypes: ['application/json'],
        }, [
          ['httpTransaction', {}, {}, [
            ['httpRequest', {}, {method: 'GET'}, []],
          ]],
        ]]
      );
    });

    it('should have element name transition', () => {
      expect(transition.element).to.equal('transition');
    });

    it('should have a method', () => {
      expect(transition.method).to.equal('GET');
    });

    it('should have a relation', () => {
      expect(transition.relation).to.equal('action');
    });

    it('should set a relation', () => {
      transition.relation = 'delete';
      expect(attrValue(transition, 'relation')).to.equal('delete');
    });

    it('should have an href', () => {
      expect(transition.href).to.equal('/resource');
    });

    it('should set an href', () => {
      transition.href = '/foo/{id}';
      expect(attrValue(transition, 'href')).to.equal('/foo/{id}');
    });

    it('should have a computed href', () => {
      expect(transition.computedHref).to.equal('/resource');
      transition.href = undefined;
      transition.transactions.first().request.attributes.set('href', '/foo');
      expect(transition.computedHref).to.equal('/foo');
    });

    it('should have data', () => {
      expect(transition.data.toValue()).to.deep.equal({});
    });

    it('should set data', () => {
      transition.data = 'test';
      expect(attrValue(transition, 'data')).to.equal('test');
    });

    it('should have contentTypes', () => {
      expect(transition.contentTypes.toValue()).to.deep.equal(
        ['application/json']
      );
    });

    it('should set contentTypes', () => {
      transition.contentTypes = ['application/xml'];
      expect(attrValue(transition, 'contentTypes')).to.deep.equal(
        ['application/xml']
      );
    });

    it('should contain a transaction', () => {
      const items = transition.transactions;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(HttpTransaction);
      });
    });
  });

  context('HTTP transaction element', () => {
    let transaction;

    beforeEach(() => {
      transaction = (new HttpTransaction()).fromCompactRefract(
        ['httpTransaction', {}, {}, [
          ['httpRequest', {}, {}, []],
          ['httpResponse', {}, {}, []],
        ]]
      );
    });

    it('should have element name httpTransaction', () => {
      expect(transaction.element).to.equal('httpTransaction');
    });

    it('should have a request', () => {
      expect(transaction.request).to.be.an.instanceof(HttpRequest);
    });

    it('should have a response', () => {
      expect(transaction.response).to.be.an.instanceof(HttpResponse);
    });
  });

  context('HTTP request element', () => {
    let request;

    beforeEach(() => {
      request = (new HttpRequest()).fromCompactRefract(
        ['httpRequest', {}, {
          method: 'GET',
          href: '/foo',
        }, []]
      );
    });

    it('should have element name httpRequest', () => {
      expect(request.element).to.equal('httpRequest');
    });

    it('should have a method', () => {
      expect(request.method).to.equal('GET');
    });

    it('should set a method', () => {
      request.method = 'POST';
      expect(attrValue(request, 'method')).to.equal('POST');
    });

    it('should have an href', () => {
      expect(request.href).to.equal('/foo');
    });

    it('should set an href', () => {
      request.href = '/bar';
      expect(attrValue(request, 'href')).to.equal('/bar');
    });

    it('should inherit from HTTP message payload', () => {
      expect(request).to.be.an.instanceof(HttpMessagePayload);
    });
  });

  context('HTTP response element', () => {
    let response;

    beforeEach(() => {
      response = (new HttpResponse()).fromCompactRefract(
        ['httpResponse', {}, {
          statusCode: 200,
        }, []]
      );
    });

    it('should have element name httpResponse', () => {
      expect(response.element).to.equal('httpResponse');
    });

    it('should have a status code', () => {
      expect(response.statusCode).to.equal(200);
    });

    it('should set a status code', () => {
      response.statusCode = 404;
      expect(attrValue(response, 'statusCode')).to.equal(404);
    });

    it('should inherit from HTTP message payload', () => {
      expect(response).to.be.an.instanceof(HttpMessagePayload);
    });
  });

  context('HTTP message payload', () => {
    let asset;
    let payload;

    beforeEach(() => {
      payload = (new HttpMessagePayload()).fromCompactRefract(
        ['httpResponse', {}, {
          headers: ['httpHeaders', {}, {}, [
            ['member', {}, {}, {
              key: ['string', {}, {}, 'Content-Type'],
              value: ['string', {}, {}, 'application/json'],
            }],
            ['member', {}, {}, {
              key: ['string', {}, {}, 'Cache'],
              value: ['string', {}, {}, 'no-cache'],
            }],
          ]],
        }, [
          ['dataStructure', {}, {}, []],
          ['asset', {classes: ['messageBody']}, {
            contentType: 'text/plain',
            href: '/some/path',
          }, ''],
          ['asset', {classes: ['messageBodySchema']}, {}, ''],
        ]]
      );
      asset = payload.messageBody;
    });

    it('should get headers', () => {
      expect(payload.headers.toValue()).to.deep.equal([
        ['Content-Type', 'application/json'],
        ['Cache', 'no-cache'],
      ]);
    });

    it('should exclude headers', () => {
      const remaining = payload.headers.exclude('cache').map(
        member => [member.key.toValue(), member.value.toValue()]
      );

      expect(remaining).to.deep.equal([
        ['Content-Type', 'application/json'],
      ]);
    });

    it('should get a header by name', () => {
      expect(payload.header('Cache')).to.deep.equal(['no-cache']);
    });

    it('should get content-type from header', () => {
      expect(payload.contentType).to.equal('application/json');
    });

    it('should contain a data structure', () => {
      expect(payload.dataStructure).to.be.an.instanceof(DataStructure);
    });

    it('should contain a message body', () => {
      expect(payload.messageBody).to.be.an.instanceof(Asset);
      expect(payload.messageBody).to.have.class('messageBody');
    });

    it('should contain a message body schema', () => {
      expect(payload.messageBodySchema).to.be.an.instanceof(Asset);
      expect(payload.messageBodySchema).to.have.class('messageBodySchema');
    });

    describe('asset', () => {
      it('should get a content type', () => {
        expect(asset.contentType).to.equal('text/plain');
      });

      it('should set a content type', () => {
        asset.contentType = 'application/json';
        expect(attrValue(asset, 'contentType')).to.equal('application/json');
      });

      it('should get an href', () => {
        expect(asset.href).to.equal('/some/path');
      });

      it('should set an href', () => {
        asset.href = '/other/path';
        expect(attrValue(asset, 'href')).to.equal('/other/path');
      });
    });
  });
});
