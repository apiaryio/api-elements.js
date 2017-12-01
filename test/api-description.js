/* eslint-disable no-unused-expressions */
/*
 * Tests for API description namespace elements, including all their
 * convenience properties and methods.
 */

import chai, { Assertion, expect } from 'chai';

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

// Hmm, this might not be the best way to do this... ideas?
const HttpMessagePayload = Object.getPrototypeOf(HttpRequest);

chai.use((_chai, utils) => {
  /*
   * Asserts that an element has a certain class.
   */
  utils.addMethod(Assertion.prototype, 'class', function hasClass(name) {
    // eslint-disable-next-line no-underscore-dangle
    const obj = this._obj;

    this.assert(
      obj.classes.contains(name),
      'Expected class list #{act} to contain #{exp}',
      'Expected class list #{act} to not contain #{exp}',
      name,
      obj.classes.toValue(),
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
          classes: {
            element: 'array',
            content: [
              {
                element: 'string',
                content: 'api',
              },
            ],
          },
        },
        attributes: {
          metadata: {
            element: 'object',
            content: [
              {
                element: 'member',
                meta: {
                  classes: {
                    element: 'array',
                    content: [
                      {
                        element: 'string',
                        content: 'user',
                      },
                    ],
                  },
                },
                content: {
                  key: {
                    element: 'string',
                    content: 'HOST',
                  },
                  value: {
                    element: 'string',
                    content: 'https://example.com',
                  },
                },
              },
            ],
          },
        },
        content: [
          {
            element: 'category',
            meta: {
              classes: {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    content: 'resourceGroup',
                  },
                ],
              },
            },
          },
          {
            element: 'category',
            meta: {
              classes: {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    content: 'dataStructures',
                  },
                ],
              },
            },
          },
          {
            element: 'category',
            meta: {
              classes: {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    content: 'scenario',
                  },
                ],
              },
            },
          },
          {
            element: 'category',
            meta: {
              classes: {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    content: 'transitions',
                  },
                ],
              },
            },
          },
          {
            element: 'category',
            meta: {
              classes: {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    content: 'authSchemes',
                  },
                ],
              },
            },
          },
          {
            element: 'resource',
          },
          {
            element: 'transition',
          },
          {
            element: 'copy',
            content: '',
          },
        ],
      };

      category = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(category)).to.deep.equal(refracted);
    });

    it('should have element name category', () => {
      expect(category.element).to.equal('category');
    });

    it('should have host API metadata', () => {
      const meta = category.attributes.get('metadata').first;
      expect(meta.key.toValue()).to.equal('HOST');
      expect(meta.value.toValue()).to.equal('https://example.com');
    });

    it('should get host API metadata', () => {
      const host = category.metadata('HOST');
      expect(host.toValue()).to.equal('https://example.com');
    });

    it('should not get API metadata which doesn\'t exist', () => {
      const random = category.metadata('random');
      expect(random).to.be.undefined;
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
          classes: {
            element: 'array',
            content: [
              {
                element: 'string',
                content: 'authSchemes',
              },
            ],
          },
        },
        content: [
          {
            element: 'Basic Authentication Scheme',
            meta: {
              id: {
                element: 'string',
                content: 'custom_basic',
              },
            },
          },
          {
            element: 'Token Authentication Scheme',
            meta: {
              id: {
                element: 'string',
                content: 'custom_api_key',
              },
            },
            content: [
              {
                element: 'member',
                content: {
                  key: {
                    element: 'string',
                    content: 'queryParameterName',
                  },
                  value: {
                    element: 'string',
                    content: 'access_token',
                  },
                },
              },
            ],
          },
          {
            element: 'OAuth2 Scheme',
            meta: {
              id: {
                element: 'string',
                content: 'custom_oauth',
              },
            },
            content: [
              {
                element: 'member',
                content: {
                  key: {
                    element: 'string',
                    content: 'grantType',
                  },
                  value: {
                    element: 'string',
                    content: 'implicit',
                  },
                },
              },
            ],
          },
        ],
      };

      category = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(category)).to.deep.equal(refracted);
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

    it('shouldn\'t have API metadata', () => {
      expect(category.metadata('random')).to.be.undefined;
    });
  });

  context('copy element', () => {
    let copy;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'copy',
        attributes: {
          contentType: {
            element: 'string',
            content: 'text/html',
          },
        },
        content: 'I am some text',
      };

      copy = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(copy)).to.deep.equal(refracted);
    });

    it('should have element name copy', () => {
      expect(copy.element).to.equal('copy');
    });

    it('should have a content type', () => {
      expect(copy.contentType.toValue()).to.equal('text/html');
    });

    it('should set a content type', () => {
      copy.contentType = 'text/plain';
      expect(attrValue(copy, 'contentType')).to.equal('text/plain');
    });

    it('should contain some text', () => {
      expect(copy.content).to.equal('I am some text');
    });
  });

  context('data structure element of number', () => {
    let number;

    beforeEach(() => {
      number = new DataStructure(3);
    });

    it('should have element name dataStructure', () => {
      expect(number.element).to.equal('dataStructure');
    });

    it('should have element content', () => {
      expect(number.content).to.be.an.instanceof(namespace.Element);
    });

    it('should get element content value', () => {
      expect(number.toValue()).to.equal(3);
    });

    it('should serialize to refract', () => {
      const refract = namespace.toRefract(number);
      expect(refract).to.deep.equal({
        element: 'dataStructure',
        content: {
          element: 'number',
          content: 3,
        },
      });
    });

    it('should load from refract', () => {
      const refract = namespace.toRefract(number);
      const loaded = namespace.fromRefract(refract);
      expect(namespace.toRefract(loaded)).to.deep.equal(refract);
    });
  });

  context('data structure element of string', () => {
    let string;

    beforeEach(() => {
      string = new DataStructure('test');
    });

    it('should have element name dataStructure', () => {
      expect(string.element).to.equal('dataStructure');
    });

    it('should have element content', () => {
      expect(string.content).to.be.an.instanceof(namespace.Element);
    });

    it('should get element content value', () => {
      expect(string.toValue()).to.equal('test');
    });

    it('should serialize to refract', () => {
      const refract = namespace.toRefract(string);
      expect(refract).to.deep.equal({
        element: 'dataStructure',
        content: {
          element: 'string',
          content: 'test',
        },
      });
    });

    it('should load from refract', () => {
      const refract = namespace.toRefract(string);
      const loaded = namespace.fromRefract(refract);
      expect(namespace.toRefract(loaded)).to.deep.equal(refract);
    });
  });

  context('data structure element of boolean', () => {
    let boolean;

    beforeEach(() => {
      boolean = new DataStructure(true);
    });

    it('should have element name dataStructure', () => {
      expect(boolean.element).to.equal('dataStructure');
    });

    it('should have element content', () => {
      expect(boolean.content).to.be.an.instanceof(namespace.Element);
    });

    it('should get element content value', () => {
      expect(boolean.toValue()).to.equal(true);
    });

    it('should serialize to refract', () => {
      const refract = namespace.toRefract(boolean);
      expect(refract).to.deep.equal({
        element: 'dataStructure',
        content: {
          element: 'boolean',
          content: true,
        },
      });
    });

    it('should load from refract', () => {
      const refract = namespace.toRefract(boolean);
      const loaded = namespace.fromRefract(refract);
      expect(namespace.toRefract(loaded)).to.deep.equal(refract);
    });
  });

  context('data structure element of array', () => {
    let array;

    beforeEach(() => {
      array = new DataStructure(['a', 1]);
    });

    it('should have element name dataStructure', () => {
      expect(array.element).to.equal('dataStructure');
    });

    it('should have element content', () => {
      expect(array.content).to.be.an.instanceof(namespace.Element);
    });

    it('should get element content value', () => {
      expect(array.toValue()).to.deep.equal(['a', 1]);
    });

    it('should serialize to refract', () => {
      const refract = namespace.toRefract(array);
      expect(refract).to.deep.equal({
        element: 'dataStructure',
        content: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'a',
            },
            {
              element: 'number',
              content: 1,
            },
          ],
        },
      });
    });

    it('should load from refract', () => {
      const refract = namespace.toRefract(array);
      const loaded = namespace.fromRefract(refract);
      expect(namespace.toRefract(loaded)).to.deep.equal(refract);
    });
  });

  context('data structure element of object', () => {
    let object;

    beforeEach(() => {
      object = new DataStructure({ a: 'a', b: 1, c: [2] });
    });

    it('should have element name dataStructure', () => {
      expect(object.element).to.equal('dataStructure');
    });

    it('should have element content', () => {
      expect(object.content).to.be.an.instanceof(namespace.Element);
    });

    it('should get element content value', () => {
      expect(object.toValue()).to.deep.equal({ a: 'a', b: 1, c: [2] });
    });

    it('should serialize to refract', () => {
      const refract = namespace.toRefract(object);
      expect(refract).to.deep.equal({
        element: 'dataStructure',
        content: {
          element: 'object',
          content: [
            {
              element: 'member',
              content: {
                key: {
                  element: 'string',
                  content: 'a',
                },
                value: {
                  element: 'string',
                  content: 'a',
                },
              },
            },
            {
              element: 'member',
              content: {
                key: {
                  element: 'string',
                  content: 'b',
                },
                value: {
                  element: 'number',
                  content: 1,
                },
              },
            },
            {
              element: 'member',
              content: {
                key: {
                  element: 'string',
                  content: 'c',
                },
                value: {
                  element: 'array',
                  content: [
                    {
                      element: 'number',
                      content: 2,
                    },
                  ],
                },
              },
            },
          ],
        },
      });
    });

    it('should load from refract', () => {
      const refract = namespace.toRefract(object);
      const loaded = namespace.fromRefract(refract);
      expect(namespace.toRefract(loaded)).to.deep.equal(refract);
    });
  });

  context('dataStructure with reference', () => {
    let refracted;
    let data;

    beforeEach(() => {
      refracted = {
        element: 'dataStructure',
        content: {
          element: 'object',
          content: [
            {
              element: 'member',
              content: {
                key: {
                  element: 'string',
                  content: 'data',
                },
                value: {
                  element: 'Session',
                },
              },
            },
          ],
        },
      };

      data = namespace.fromRefract(refracted);
    });

    it('should load from refract', () => {
      expect(namespace.toRefract(data)).to.deep.equal(refracted);
    });

    it('should give the correct value', () => {
      expect(data.toValue()).to.deep.equal({ data: undefined });
    });
  });

  context('resource element', () => {
    let resource;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'resource',
        attributes: {
          href: {
            element: 'string',
            content: '/resource/{id}',
          },
          hrefVariables: {
            element: 'hrefVariables',
            content: [
              {
                element: 'member',
                content: {
                  key: {
                    element: 'string',
                    content: 'id',
                  },
                  value: {
                    element: 'string',
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
            content: 'copy of resource',
          },
          {
            element: 'transition',
          },
          {
            element: 'dataStructure',
            content: {
              element: 'object',
            },
          },
        ],
      };

      resource = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(resource)).to.deep.equal(refracted);
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
      expect(resource.href.toValue()).to.equal('/resource/{id}');
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
        attributes: {
          relation: {
            element: 'string',
            content: 'action',
          },
          href: {
            element: 'string',
            content: '/resource',
          },
          hrefVariables: {
            element: 'hrefVariables',
            content: [
              {
                element: 'member',
                content: {
                  key: {
                    element: 'string',
                    content: 'id',
                  },
                  value: {
                    element: 'string',
                    content: '123',
                  },
                },
              },
            ],
          },
          data: {
            element: 'dataStructure',
            content: {
              element: 'object',
            },
          },
          contentTypes: {
            element: 'array',
            content: [
              {
                element: 'string',
                content: 'application/json',
              },
            ],
          },
        },
        content: [
          {
            element: 'copy',
            content: 'copy of transition',
          },
          {
            element: 'httpTransaction',
            content: [
              {
                element: 'httpRequest',
                attributes: {
                  method: {
                    element: 'string',
                    content: 'GET',
                  },
                },
              },
            ],
          },
        ],
      };

      transition = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(transition)).to.deep.equal(refracted);
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
      expect(transition.method.toValue()).to.equal('GET');
    });

    it('should have a relation', () => {
      expect(transition.relation.toValue()).to.equal('action');
    });

    it('should set a relation', () => {
      transition.relation = 'delete';
      expect(attrValue(transition, 'relation')).to.equal('delete');
    });

    it('should have an href', () => {
      expect(transition.href.toValue()).to.equal('/resource');
    });

    it('should set an href', () => {
      transition.href = '/foo/{id}';
      expect(attrValue(transition, 'href')).to.equal('/foo/{id}');
    });

    it('should have a computed href', () => {
      expect(transition.computedHref.toValue()).to.equal('/resource');
      transition.href = undefined;
      transition.transactions.first.request.attributes.set('href', '/foo');
      expect(transition.computedHref.toValue()).to.equal('/foo');
    });

    it('should have hrefVariables', () => {
      expect(transition.hrefVariables.toValue()).to.deep.equal({
        id: '123',
      });
    });

    it('should set hrefVariables', () => {
      transition.hrefVariables = {
        id: '456',
      };
      expect(attrValue(transition, 'hrefVariables')).to.deep.equal({
        id: '456',
      });
    });

    it('should have data', () => {
      expect(transition.data.toValue()).to.deep.equal({});
    });

    it('should set data', () => {
      transition.data = 'test';
      expect(attrValue(transition, 'data')).to.equal('test');
    });

    it('should have contentTypes', () => {
      expect(transition.contentTypes.toValue()).to.deep
        .equal(['application/json']);
    });

    it('should set contentTypes', () => {
      transition.contentTypes = ['application/xml'];
      expect(attrValue(transition, 'contentTypes')).to.deep
        .equal(['application/xml']);
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
          id: {
            element: 'string',
            content: 'Custom Token Auth',
          },
        },
        content: [
          {
            element: 'copy',
            content: 'copy of auth scheme',
          },
          {
            element: 'member',
            content: {
              key: {
                element: 'string',
                content: 'queryParameterName',
              },
              value: {
                element: 'string',
                content: 'token',
              },
            },
          },
          {
            element: 'transition',
            attributes: {
              relation: {
                element: 'string',
                content: 'authorize',
              },
              href: {
                element: 'string',
                content: 'http://example.com/oauth/authorize',
              },
            },
          },
        ],
      };

      const element = namespace.fromRefract(refracted);
      authScheme = new AuthScheme([], element.meta, element.attributes);
      authScheme.element = element.element;
      authScheme.content = element.content;
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(authScheme)).to.deep.equal(refracted);
    });

    it('should contain a copy element', () => {
      const items = authScheme.copy;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Copy);
      });
    });

    it('should contain members', () => {
      const { members } = authScheme;
      expect(members).to.have.length(1);
      members.forEach((item) => {
        expect(item).to.be.an.instanceof(MemberElement);
      });
    });

    it('should contain transitions', () => {
      const { transitions } = authScheme;
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
        attributes: {
          authSchemes: {
            element: 'array',
            content: [
              {
                element: 'Token Authentication Scheme',
              },
            ],
          },
        },
        content: [
          {
            element: 'httpRequest',
          },
          {
            element: 'httpResponse',
          },
        ],
      };

      transaction = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(transaction)).to.deep.equal(refracted);
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
        attributes: {
          method: {
            element: 'string',
            content: 'GET',
          },
          href: {
            element: 'string',
            content: '/foo',
          },
        },
        content: [
          {
            element: 'copy',
            content: 'copy of request',
          },
        ],
      };

      request = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(request)).to.deep.equal(refracted);
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
      expect(request.method.toValue()).to.equal('GET');
    });

    it('should set a method', () => {
      request.method = 'POST';
      expect(attrValue(request, 'method')).to.equal('POST');
    });

    it('should have an href', () => {
      expect(request.href.toValue()).to.equal('/foo');
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
        attributes: {
          statusCode: {
            element: 'number',
            content: 200,
          },
        },
        content: [
          {
            element: 'copy',
            content: 'copy of response',
          },
        ],
      };

      response = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(response)).to.deep.equal(refracted);
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
      expect(response.statusCode.toValue()).to.equal(200);
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
        attributes: {
          headers: {
            element: 'httpHeaders',
            content: [
              {
                element: 'member',
                content: {
                  key: {
                    element: 'string',
                    content: 'Content-Type',
                  },
                  value: {
                    element: 'string',
                    content: 'application/json',
                  },
                },
              },
              {
                element: 'member',
                content: {
                  key: {
                    element: 'string',
                    content: 'Cache',
                  },
                  value: {
                    element: 'string',
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
            content: {
              element: 'object',
            },
          },
          {
            element: 'asset',
            meta: {
              classes: {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    content: 'messageBody',
                  },
                ],
              },
            },
            attributes: {
              contentType: {
                element: 'string',
                content: 'text/plain',
              },
              href: {
                element: 'string',
                content: '/some/path',
              },
            },
            content: '',
          },
          {
            element: 'asset',
            meta: {
              classes: {
                element: 'array',
                content: [
                  {
                    element: 'string',
                    content: 'messageBodySchema',
                  },
                ],
              },
            },
            content: '',
          },
        ],
      };

      payload = namespace.fromRefract(refracted);
      asset = payload.messageBody;
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(payload)).to.deep.equal(refracted);
    });

    it('should get headers', () => {
      expect(payload.headers.toValue()).to.deep.equal([
        {
          key: 'Content-Type',
          value: 'application/json',
        },
        {
          key: 'Cache',
          value: 'no-cache',
        },
      ]);
    });

    it('should exclude headers', () => {
      const remaining = payload.headers.exclude('cache')
        .map(member => [member.key.toValue(), member.value.toValue()]);

      expect(remaining).to.deep.equal([
        ['Content-Type', 'application/json'],
      ]);
    });

    it('should get a header by name', () => {
      const header = payload.header('Cache').map(item => item.toValue());

      expect(header).to.deep.equal(['no-cache']);
    });

    it('should get content-type from header', () => {
      expect(payload.contentType.toValue()).to.equal('application/json');
    });

    it('should set headers', () => {
      payload.headers = {
        'Content-Length': 100,
      };

      expect(attrValue(payload, 'headers')).to.deep.equal({
        'Content-Length': 100,
      });
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
        expect(asset.contentType.toValue()).to.equal('text/plain');
      });

      it('should set a content type', () => {
        asset.contentType = 'application/json';
        expect(attrValue(asset, 'contentType')).to.equal('application/json');
      });

      it('should get an href', () => {
        expect(asset.href.toValue()).to.equal('/some/path');
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
          links: {
            element: 'array',
            content: [
              {
                element: 'link',
                attributes: {
                  relation: {
                    element: 'string',
                    content: 'profile',
                  },
                  href: {
                    element: 'string',
                    content: 'https://example.com/extensions/info/',
                  },
                },
              },
            ],
          },
        },
        content: [
          {
            element: 'member',
            content: {
              key: {
                element: 'string',
                content: 'version',
              },
              value: {
                element: 'number',
                content: 1.0,
              },
            },
          },
        ],
      };

      extension = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(extension)).to.deep.equal(refracted);
    });

    it('should have element name extension', () => {
      expect(extension.element).to.equal('extension');
    });

    it('should have a profile', () => {
      expect(extension.profile.toValue()).to.equal('https://example.com/extensions/info/');
    });
  });
});
