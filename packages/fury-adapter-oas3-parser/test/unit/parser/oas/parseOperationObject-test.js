const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseOperationObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Operation Object', () => {
  let context;
  const path = new namespace.elements.String('/');

  beforeEach(() => {
    context = new Context(namespace);
  });

  it('returns a transition', () => {
    const operation = new namespace.elements.Member('get', {
      responses: {},
    });

    const parseResult = parse(context, path, operation);

    expect(parseResult.length).to.equal(1);
    const transition = parseResult.get(0);
    expect(transition).to.be.instanceof(namespace.elements.Transition);
  });

  it('returns a transition including a transaction', () => {
    const operation = new namespace.elements.Member('get', {
      responses: {
        200: {
          description: 'dummy',
        },
      },
    });

    const parseResult = parse(context, path, operation);

    expect(parseResult.length).to.equal(1);

    const transition = parseResult.get(0);
    expect(transition).to.be.instanceof(namespace.elements.Transition);
    expect(transition.length).to.equal(1);

    const transaction = transition.get(0);
    expect(transaction).to.be.instanceof(namespace.elements.HttpTransaction);
    expect(transaction.length).to.equal(2);

    expect(transaction.request).to.be.instanceof(namespace.elements.HttpRequest);
    expect(transaction.request.method.toValue()).to.equal('GET');
    expect(transaction.response).to.be.instanceof(namespace.elements.HttpResponse);
  });

  it('provides warning when operation is non-object', () => {
    const operation = new namespace.elements.Member('get', null);

    const parseResult = parse(context, path, operation);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Operation Object' is not an object");
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported tags key', () => {
      const operation = new namespace.elements.Member('get', {
        tags: [],
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult).to.contain.warning("'Operation Object' contains unsupported key 'tags'");
    });

    it('provides warning for unsupported externalDocs key', () => {
      const operation = new namespace.elements.Member('get', {
        externalDocs: '',
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult).to.contain.warning("'Operation Object' contains unsupported key 'externalDocs'");
    });

    it('provides warning for unsupported callbacks key', () => {
      const operation = new namespace.elements.Member('get', {
        callbacks: '',
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult).to.contain.warning("'Operation Object' contains unsupported key 'callbacks'");
    });

    it('provides warning for unsupported deprecated key', () => {
      const operation = new namespace.elements.Member('get', {
        deprecated: '',
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult).to.contain.warning("'Operation Object' contains unsupported key 'deprecated'");
    });

    it('provides warning for unsupported security key', () => {
      const operation = new namespace.elements.Member('get', {
        security: '',
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult).to.contain.warning("'Operation Object' contains unsupported key 'security'");
    });

    it('does not provide warning/errors for extensions', () => {
      const operation = new namespace.elements.Member('get', {
        responses: {},
        'x-extension': '',
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const operation = new namespace.elements.Member('get', {
      responses: {},
      invalid: '',
    });

    const parseResult = parse(context, path, operation);

    expect(parseResult).to.contain.warning("'Operation Object' contains invalid key 'invalid'");
  });

  describe('missing required properties', () => {
    it('provides error for missing responses', () => {
      const operation = new namespace.elements.Member('get', {});

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Operation Object' is missing required property 'responses'");
    });
  });


  describe('#summary', () => {
    it('warns when summary is not a string', () => {
      const operation = new namespace.elements.Member('get', {
        summary: [],
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(parseResult).to.contain.warning("'Operation Object' 'summary' is not a string");
    });

    it('returns a transition with a summary', () => {
      const operation = new namespace.elements.Member('get', {
        summary: 'Example Summary',
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(1);

      const transition = parseResult.get(0);
      expect(transition).to.be.instanceof(namespace.elements.Transition);
      expect(transition.title.toValue()).to.equal('Example Summary');
    });
  });

  describe('#description', () => {
    it('exposes description as a copy element in the transition', () => {
      const operation = new namespace.elements.Member('get', {
        description: 'This is a transition',
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);
      expect(parseResult.get(0).copy.toValue()).to.deep.equal(['This is a transition']);
    });

    it('warns when description is not a string', () => {
      const operation = new namespace.elements.Member('get', {
        description: {},
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(parseResult).to.contain.warning("'Operation Object' 'description' is not a string");
    });
  });

  describe('#operationId', () => {
    it('warns when operationId is not a string', () => {
      const operation = new namespace.elements.Member('get', {
        operationId: [],
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(parseResult).to.contain.warning("'Operation Object' 'operationId' is not a string");
    });

    it('returns a transition with an id', () => {
      const operation = new namespace.elements.Member('get', {
        operationId: 'exampleId',
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(1);

      const transition = parseResult.get(0);
      expect(transition).to.be.instanceof(namespace.elements.Transition);
      expect(transition.id.toValue()).to.equal('exampleId');
    });

    it('warns when operationId is not unique', () => {
      const operationA = new namespace.elements.Member('get', {
        operationId: 'exampleId',
        responses: {},
      });

      const operationB = new namespace.elements.Member('get', {
        operationId: 'exampleId',
        responses: {},
      });

      const parseResultA = parse(context, path, operationA);

      {
        expect(parseResultA.length).to.equal(1);
        const transition = parseResultA.get(0);
        expect(transition).to.be.instanceof(namespace.elements.Transition);
        expect(transition.id.toValue()).to.equal('exampleId');
      }

      const parseResultB = parse(context, path, operationB);
      {
        expect(parseResultB.length).to.equal(2);
        const transition = parseResultB.get(0);
        expect(transition).to.be.instanceof(namespace.elements.Transition);
        expect(parseResultB).to.contain.warning("'Operation Object' 'operationId' is not a unique identifier: 'exampleId'");
      }
    });
  });

  describe('#parameters', () => {
    it('warns when parameters is not an array', () => {
      const operation = new namespace.elements.Member('get', {
        parameters: {},
        responses: {},
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(parseResult).to.contain.warning("'Operation Object' 'parameters' is not an array");
    });

    describe('path parameters', () => {
      it('exposes parameter in hrefVariables', () => {
        const operation = new namespace.elements.Member('get', {
          parameters: [
            {
              name: 'resource',
              in: 'path',
              required: true,
            },
          ],
          responses: {},
        });

        const parseResult = parse(context, path, operation);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = parseResult.get(0);
        expect(transition.hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
        expect(transition.hrefVariables.length).to.equal(1);
        expect(transition.hrefVariables.getMember('resource')).to.be.instanceof(namespace.elements.Member);
      });
    });

    describe('query parameters', () => {
      it('exposes query parameter in href', () => {
        const operation = new namespace.elements.Member('get', {
          parameters: [
            {
              name: 'categories',
              in: 'query',
            },
          ],
          responses: {},
        });

        const parseResult = parse(context, path, operation);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = parseResult.get(0);
        expect(transition.href.toValue()).to.equal('/{?categories}');
      });

      it('exposes multiple query parameter in href', () => {
        const operation = new namespace.elements.Member('get', {
          parameters: [
            {
              name: 'categories',
              in: 'query',
            },
            {
              name: 'tags',
              in: 'query',
            },
          ],
          responses: {},
        });

        const parseResult = parse(context, path, operation);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = parseResult.get(0);
        expect(transition.href.toValue()).to.equal('/{?categories,tags}');
      });

      it('exposes query parameter in hrefVariables', () => {
        const operation = new namespace.elements.Member('get', {
          parameters: [
            {
              name: 'resource',
              in: 'query',
            },
          ],
          responses: {},
        });

        const parseResult = parse(context, path, operation);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = parseResult.get(0);
        expect(transition.hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
        expect(transition.hrefVariables.length).to.equal(1);
        expect(transition.hrefVariables.getMember('resource')).to.be.instanceof(namespace.elements.Member);
      });
    });

    describe('header parameters', () => {
      it('exposes header parameter in request headers', () => {
        const operation = new namespace.elements.Member('get', {
          parameters: [
            {
              name: 'Accept',
              in: 'header',
              example: 'application/json',
            },
          ],
          responses: {
            200: {
              description: 'dummy',
            },
          },
        });

        const parseResult = parse(context, path, operation);

        expect(parseResult.length).to.equal(1);
        expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = parseResult.get(0);
        expect(transition.transactions.length).to.equal(1);

        const transaction = transition.transactions.get(0);
        const { request } = transaction;

        expect(request.headers).to.be.instanceof(namespace.elements.HttpHeaders);
        expect(request.headers.toValue()).to.deep.equal([
          {
            key: 'Accept',
            value: 'application/json',
          },
        ]);
      });

      it('does not override request body content type header', () => {
        const operation = new namespace.elements.Member('post', {
          parameters: [
            {
              name: 'Content-Type',
              in: 'header',
              example: 'application/json',
            },
          ],
          requestBody: {
            content: {
              'application/xml': {},
            },
          },
          responses: {
            204: {
              description: 'empty response',
            },
          },
        });

        const parseResult = parse(context, path, operation);

        expect(parseResult.length).to.equal(1);

        const transition = parseResult.get(0);
        expect(transition).to.be.instanceof(namespace.elements.Transition);

        const transaction = transition.get(0);
        expect(transaction).to.be.instanceof(namespace.elements.HttpTransaction);

        expect(transaction.request).to.be.instanceof(namespace.elements.HttpRequest);
        expect(transaction.request.headers.toValue()).to.deep.equal([
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ]);
      });

      it('merges headers with operation headers', () => {
        const operation = new namespace.elements.Member('post', {
          parameters: [
            {
              name: 'Content-Type',
              in: 'header',
              example: 'application/json',
            },
            {
              name: 'Link',
              in: 'header',
              example: '<https://api.github.com/user/repos?page=3&per_page=100>; rel="next"',
            },
          ],
          requestBody: {
            content: {
              'application/xml': {},
            },
          },
          responses: {
            204: {
              description: 'empty response',
            },
          },
        });

        const parseResult = parse(context, path, operation);

        expect(parseResult.length).to.equal(1);

        const transition = parseResult.get(0);
        expect(transition).to.be.instanceof(namespace.elements.Transition);

        const transaction = transition.get(0);
        expect(transaction).to.be.instanceof(namespace.elements.HttpTransaction);

        expect(transaction.request).to.be.instanceof(namespace.elements.HttpRequest);
        expect(transaction.request.headers.toValue()).to.deep.equal([
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Link',
            value: '<https://api.github.com/user/repos?page=3&per_page=100>; rel="next"',
          },
        ]);
      });
    });
  });

  describe('#responses', () => {
    it('returns a transition including a transaction', () => {
      const operation = new namespace.elements.Member('get', {
        responses: {
          200: {
            description: 'example',
            content: {
              'application/json': {},
              'application/xml': {},
            },
          },
        },
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(1);

      const transition = parseResult.get(0);
      expect(transition).to.be.instanceof(namespace.elements.Transition);
      expect(transition.length).to.equal(2);

      const transaction1 = transition.get(0);
      expect(transaction1).to.be.instanceof(namespace.elements.HttpTransaction);
      expect(transaction1.length).to.equal(2);

      expect(transaction1.request).to.be.instanceof(namespace.elements.HttpRequest);
      expect(transaction1.response).to.be.instanceof(namespace.elements.HttpResponse);
      expect(transaction1.response.contentType.toValue()).to.be.equal('application/json');

      const transaction2 = transition.get(1);
      expect(transaction2).to.be.instanceof(namespace.elements.HttpTransaction);
      expect(transaction2.length).to.equal(2);

      expect(transaction2.request).to.be.instanceof(namespace.elements.HttpRequest);
      expect(transaction2.response).to.be.instanceof(namespace.elements.HttpResponse);
      expect(transaction2.response.contentType.toValue()).to.be.equal('application/xml');
    });
  });

  describe('#requestBody', () => {
    it('exposes request bodies in transaction pairs', () => {
      const operation = new namespace.elements.Member('post', {
        requestBody: {
          content: {
            'application/json': {},
            'application/xml': {},
          },
        },
        responses: {
          204: {
            description: 'empty response',
          },
        },
      });

      const parseResult = parse(context, path, operation);

      expect(parseResult.length).to.equal(1);

      const transition = parseResult.get(0);
      expect(transition).to.be.instanceof(namespace.elements.Transition);
      expect(transition.length).to.equal(2);

      const transaction1 = transition.get(0);
      expect(transaction1).to.be.instanceof(namespace.elements.HttpTransaction);
      expect(transaction1.length).to.equal(2);

      expect(transaction1.request).to.be.instanceof(namespace.elements.HttpRequest);
      expect(transaction1.request.method.toValue()).to.equal('POST');
      expect(transaction1.request.contentType.toValue()).to.equal('application/json');
      expect(transaction1.response).to.be.instanceof(namespace.elements.HttpResponse);

      const transaction2 = transition.get(1);
      expect(transaction2).to.be.instanceof(namespace.elements.HttpTransaction);
      expect(transaction2.length).to.equal(2);

      expect(transaction2.request).to.be.instanceof(namespace.elements.HttpRequest);
      expect(transaction2.request.method.toValue()).to.equal('POST');
      expect(transaction2.request.contentType.toValue()).to.equal('application/xml');
      expect(transaction2.response).to.be.instanceof(namespace.elements.HttpResponse);
    });
  });
});
