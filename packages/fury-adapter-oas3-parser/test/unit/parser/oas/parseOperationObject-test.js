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

    const result = parse(context, path, operation);

    expect(result.length).to.equal(1);
    const transition = result.get(0);
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

    const result = parse(context, path, operation);

    expect(result.length).to.equal(1);

    const transition = result.get(0);
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

    const result = parse(context, path, operation);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Operation Object' is not an object");
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported tags key', () => {
      const operation = new namespace.elements.Member('get', {
        tags: [],
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result).to.contain.warning("'Operation Object' contains unsupported key 'tags'");
    });

    it('provides warning for unsupported externalDocs key', () => {
      const operation = new namespace.elements.Member('get', {
        externalDocs: '',
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result).to.contain.warning("'Operation Object' contains unsupported key 'externalDocs'");
    });

    it('provides warning for unsupported callbacks key', () => {
      const operation = new namespace.elements.Member('get', {
        callbacks: '',
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result).to.contain.warning("'Operation Object' contains unsupported key 'callbacks'");
    });

    it('provides warning for unsupported deprecated key', () => {
      const operation = new namespace.elements.Member('get', {
        deprecated: '',
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result).to.contain.warning("'Operation Object' contains unsupported key 'deprecated'");
    });

    it('provides warning for unsupported security key', () => {
      const operation = new namespace.elements.Member('get', {
        security: '',
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result).to.contain.warning("'Operation Object' contains unsupported key 'security'");
    });

    it('does not provide warning/errors for extensions', () => {
      const operation = new namespace.elements.Member('get', {
        responses: {},
        'x-extension': '',
      });

      const result = parse(context, path, operation);

      expect(result).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const operation = new namespace.elements.Member('get', {
      responses: {},
      invalid: '',
    });

    const result = parse(context, path, operation);

    expect(result).to.contain.warning("'Operation Object' contains invalid key 'invalid'");
  });

  describe('missing required properties', () => {
    it('provides error for missing responses', () => {
      const operation = new namespace.elements.Member('get', {});

      const result = parse(context, path, operation);

      expect(result.length).to.equal(1);
      expect(result).to.contain.error("'Operation Object' is missing required property 'responses'");
    });
  });


  describe('#summary', () => {
    it('warns when summary is not a string', () => {
      const operation = new namespace.elements.Member('get', {
        summary: [],
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(result).to.contain.warning("'Operation Object' 'summary' is not a string");
    });

    it('returns a transition with a summary', () => {
      const operation = new namespace.elements.Member('get', {
        summary: 'Example Summary',
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result.length).to.equal(1);

      const transition = result.get(0);
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

      const result = parse(context, path, operation);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);
      expect(result.get(0).copy.toValue()).to.deep.equal(['This is a transition']);
    });

    it('warns when description is not a string', () => {
      const operation = new namespace.elements.Member('get', {
        description: {},
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(result).to.contain.warning("'Operation Object' 'description' is not a string");
    });
  });

  describe('#operationId', () => {
    it('warns when operationId is not a string', () => {
      const operation = new namespace.elements.Member('get', {
        operationId: [],
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(result).to.contain.warning("'Operation Object' 'operationId' is not a string");
    });

    it('returns a transition with an id', () => {
      const operation = new namespace.elements.Member('get', {
        operationId: 'exampleId',
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result.length).to.equal(1);

      const transition = result.get(0);
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

      const resultA = parse(context, path, operationA);

      {
        expect(resultA.length).to.equal(1);
        const transition = resultA.get(0);
        expect(transition).to.be.instanceof(namespace.elements.Transition);
        expect(transition.id.toValue()).to.equal('exampleId');
      }

      const resultB = parse(context, path, operationB);
      {
        expect(resultB.length).to.equal(2);
        const transition = resultB.get(0);
        expect(transition).to.be.instanceof(namespace.elements.Transition);
        expect(resultB).to.contain.warning("'Operation Object' 'operationId' is not a unique identifier: 'exampleId'");
      }
    });
  });

  describe('#parameters', () => {
    it('warns when parameters is not an array', () => {
      const operation = new namespace.elements.Member('get', {
        parameters: {},
        responses: {},
      });

      const result = parse(context, path, operation);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

      expect(result).to.contain.warning("'Operation Object' 'parameters' is not an array");
    });

    describe('path parameters', () => {
      it('exposes parameter in hrefVariables', () => {
        const operation = new namespace.elements.Member('get', {
          parameters: [
            {
              name: 'resource',
              in: 'path',
            },
          ],
          responses: {},
        });

        const result = parse(context, path, operation);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = result.get(0);
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

        const result = parse(context, path, operation);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = result.get(0);
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

        const result = parse(context, path, operation);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = result.get(0);
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

        const result = parse(context, path, operation);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Transition);

        const transition = result.get(0);
        expect(transition.hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
        expect(transition.hrefVariables.length).to.equal(1);
        expect(transition.hrefVariables.getMember('resource')).to.be.instanceof(namespace.elements.Member);
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

      const result = parse(context, path, operation);

      expect(result.length).to.equal(1);

      const transition = result.get(0);
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

      const result = parse(context, path, operation);

      expect(result.length).to.equal(1);

      const transition = result.get(0);
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
