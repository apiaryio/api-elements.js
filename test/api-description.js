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
const AuthScheme = namespace.getElementClass('authScheme');
const DataStructure = namespace.getElementClass('dataStructure');
const MemberElement = namespace.getElementClass('member');
const Extension = namespace.getElementClass('extension');

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
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'category',
        meta: {
          classes: ['api'],
        },
        attributes: {
          meta: [
            {
              element: 'member',
              meta: {
                classes: ['user'],
              },
              attributes: {},
              content: {
                key: {
                  element: 'string',
                  meta: {},
                  attributes: {},
                  content: 'HOST',
                },
                value: {
                  element: 'string',
                  meta: {},
                  attributes: {},
                  content: 'https://example.com',
                },
              },
            },
          ],
        },
        content: [
          {
            element: 'category',
            meta: {
              classes: ['resourceGroup'],
            },
            attributes: {},
            content: [],
          },
          {
            element: 'category',
            meta: {
              classes: ['dataStructures'],
            },
            attributes: {},
            content: [],
          },
          {
            element: 'category',
            meta: {
              classes: ['scenario'],
            },
            attributes: {},
            content: [],
          },
          {
            element: 'category',
            meta: {
              classes: ['transitions'],
            },
            attributes: {},
            content: [],
          },
          {
            element: 'category',
            meta: {
              classes: ['authSchemes'],
            },
            attributes: {},
            content: [],
          },
          {
            element: 'resource',
            meta: {},
            attributes: {},
            content: [],
          },
          {
            element: 'transition',
            meta: {},
            attributes: {},
            content: [],
          },
          {
            element: 'copy',
            meta: {},
            attributes: {},
            content: '',
          },
        ],
      };

      category = (new Category()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(category.toRefract()).to.deep.equal(refracted);
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

    it('should contain an auth scheme group', () => {
      const items = category.authSchemeGroups;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Category);
        expect(item).to.have.class('authSchemes');
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

  context('auth scheme group element', () => {
    let category;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'category',
        meta: {
          classes: ['authSchemes'],
        },
        attributes: {},
        content: [
          {
            element: 'Basic Authentication Scheme',
            meta: {
              id: 'custom_basic',
            },
            attributes: {},
            content: [],
          },
          {
            element: 'Token Authentication Scheme',
            meta: {
              id: 'custom_api_key',
            },
            attributes: {},
            content: [
              {
                element: 'member',
                meta: {},
                attributes: {},
                content: {
                  key: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'queryParameterName',
                  },
                  value: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'access_token',
                  },
                },
              },
            ],
          },
          {
            element: 'OAuth2 Scheme',
            meta: {
              id: 'custom_oauth',
            },
            attributes: {},
            content: [
              {
                element: 'member',
                meta: {},
                attributes: {},
                content: {
                  key: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'grantType',
                  },
                  value: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'implicit',
                  },
                },
              },
            ],
          },
        ],
      };

      category = (new Category()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(category.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name category', () => {
      expect(category.element).to.equal('category');
    });

    it('should contain auth schemes', () => {
      const items = category.authSchemes;
      expect(items).to.have.length(3);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(AuthScheme);
      });
    });
  });

  context('copy element', () => {
    let copy;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'copy',
        meta: {},
        attributes: {
          contentType: 'text/html',
        },
        content: 'I am some text',
      };

      copy = (new Copy()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(copy.toRefract()).to.deep.equal(refracted);
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

    it('should load from refract', () => {
      const refract = struct.toRefract();
      const loaded = (new DataStructure()).fromRefract(refract);
      expect(loaded.toRefract()).to.deep.equal(refract);
    });

    it('should support arrays as content', () => {
      const refract = {
        element: 'dataStructure',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'object',
            meta: {
              id: 'User',
            },
            attributes: {},
            content: [],
          },
        ],
      };

      const element = namespace.fromRefract(refract);
      expect(element.toRefract()).to.deep.equal(refract);
    });
  });

  context('resource element', () => {
    let resource;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'resource',
        meta: {},
        attributes: {
          href: '/resource/{id}',
          hrefVariables: {
            element: 'hrefVariables',
            meta: {},
            attributes: {},
            content: [
              {
                element: 'member',
                meta: {},
                attributes: {},
                content: {
                  key: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'id',
                  },
                  value: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: '123',
                  },
                },
              },
            ],
          },
        },
        content: [
          {
            element: 'copy',
            meta: {},
            attributes: {},
            content: 'copy of resource',
          },
          {
            element: 'transition',
            meta: {},
            attributes: {},
            content: [],
          },
          {
            element: 'dataStructure',
            meta: {},
            attributes: {},
            content: {
              element: 'object',
              meta: {},
              attributes: {},
              content: [],
            },
          },
        ],
      };

      resource = (new Resource()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(resource.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name resource', () => {
      expect(resource.element).to.equal('resource');
    });

    it('should contain a copy element', () => {
      const items = resource.copy;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Copy);
      });
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
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'transition',
        meta: {},
        attributes: {
          relation: 'action',
          href: '/resource',
          data: {
            element: 'dataStructure',
            meta: {},
            attributes: {},
            content: {
              element: 'object',
              meta: {},
              attributes: {},
              content: [],
            },
          },
          contentTypes: ['application/json'],
        },
        content: [
          {
            element: 'copy',
            meta: {},
            attributes: {},
            content: 'copy of transition',
          },
          {
            element: 'httpTransaction',
            meta: {},
            attributes: {},
            content: [
              {
                element: 'httpRequest',
                meta: {},
                attributes: {
                  method: 'GET',
                },
                content: [],
              },
            ],
          },
        ],
      };

      transition = (new Transition()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(transition.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name transition', () => {
      expect(transition.element).to.equal('transition');
    });

    it('should contain a copy element', () => {
      const items = transition.copy;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Copy);
      });
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

  context('Auth scheme element', () => {
    let authScheme;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'Token Auth Scheme',
        meta: {
          id: 'Custom Token Auth',
        },
        attributes: {},
        content: [
          {
            element: 'copy',
            meta: {},
            attributes: {},
            content: 'copy of auth scheme',
          },
          {
            element: 'member',
            meta: {},
            attributes: {},
            content: {
              key: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'queryParameterName',
              },
              value: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'token',
              },
            },
          },
          {
            element: 'transition',
            meta: {},
            attributes: {
              relation: 'authorize',
              href: 'http://example.com/oauth/authorize',
            },
            content: [],
          },
        ],
      };

      authScheme = (new AuthScheme()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(authScheme.toRefract()).to.deep.equal(refracted);
    });

    it('should contain a copy element', () => {
      const items = authScheme.copy;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Copy);
      });
    });

    it('should contain members', () => {
      const members = authScheme.members;
      expect(members).to.have.length(1);
      members.forEach((item) => {
        expect(item).to.be.an.instanceof(MemberElement);
      });
    });

    it('should contain transitions', () => {
      const transitions = authScheme.transitions;
      expect(transitions).to.have.length(1);
      transitions.forEach((item) => {
        expect(item).to.be.an.instanceof(Transition);
      });
    });
  });

  context('HTTP transaction element', () => {
    let transaction;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'httpTransaction',
        meta: {},
        attributes: {
          authSchemes: [
            {
              element: 'Custom Token Auth',
              meta: {},
              attributes: {},
              content: [],
            },
          ],
        },
        content: [
          {
            element: 'httpRequest',
            meta: {},
            attributes: {},
            content: [],
          },
          {
            element: 'httpResponse',
            meta: {},
            attributes: {},
            content: [],
          },
        ],
      };

      transaction = (new HttpTransaction()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(transaction.toRefract()).to.deep.equal(refracted);
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

    it('should contain auth schemes', () => {
      const schemes = transaction.authSchemes;
      expect(schemes).to.have.length(1);
      schemes.forEach((item) => {
        expect(item).to.be.an.instanceof(AuthScheme);
      });
    });
  });

  context('HTTP request element', () => {
    let request;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'httpRequest',
        meta: {},
        attributes: {
          method: 'GET',
          href: '/foo',
        },
        content: [
          {
            element: 'copy',
            meta: {},
            attributes: {},
            content: 'copy of request',
          },
        ],
      };

      request = (new HttpRequest()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(request.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name httpRequest', () => {
      expect(request.element).to.equal('httpRequest');
    });

    it('should contain a copy element', () => {
      const items = request.copy;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Copy);
      });
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
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'httpResponse',
        meta: {},
        attributes: {
          statusCode: 200,
        },
        content: [
          {
            element: 'copy',
            meta: {},
            attributes: {},
            content: 'copy of response',
          },
        ],
      };

      response = (new HttpResponse()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(response.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name httpResponse', () => {
      expect(response.element).to.equal('httpResponse');
    });

    it('should contain a copy element', () => {
      const items = response.copy;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Copy);
      });
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
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'httpResponse',
        meta: {},
        attributes: {
          headers: {
            element: 'httpHeaders',
            meta: {},
            attributes: {},
            content: [
              {
                element: 'member',
                meta: {},
                attributes: {},
                content: {
                  key: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'Content-Type',
                  },
                  value: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'application/json',
                  },
                },
              },
              {
                element: 'member',
                meta: {},
                attributes: {},
                content: {
                  key: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'Cache',
                  },
                  value: {
                    element: 'string',
                    meta: {},
                    attributes: {},
                    content: 'no-cache',
                  },
                },
              },
            ],
          },
        },
        content: [
          {
            element: 'dataStructure',
            meta: {},
            attributes: {},
            content: {
              element: 'object',
              meta: {},
              attributes: {},
              content: [],
            },
          },
          {
            element: 'asset',
            meta: {
              classes: ['messageBody'],
            },
            attributes: {
              contentType: 'text/plain',
              href: '/some/path',
            },
            content: '',
          },
          {
            element: 'asset',
            meta: {
              classes: ['messageBodySchema'],
            },
            attributes: {},
            content: '',
          },
        ],
      };

      payload = (new HttpMessagePayload()).fromRefract(refracted);
      asset = payload.messageBody;
    });

    it('should round-trip correctly', () => {
      expect(payload.toRefract()).to.deep.equal(refracted);
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

  describe('extension element', () => {
    let extension;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'extension',
        meta: {
          links: [
            {
              element: 'link',
              meta: {},
              attributes: {
                relation: 'profile',
                href: 'https://example.com/extensions/info/',
              },
              content: undefined,
            },
          ],
        },
        attributes: {},
        content: {
          version: 1.0,
        },
      };

      extension = (new Extension()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(extension.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name extension', () => {
      expect(extension.element).to.equal('extension');
    });

    it('should have a profile', () => {
      expect(extension.profile).to.equal('https://example.com/extensions/info/');
    });
  });
});
