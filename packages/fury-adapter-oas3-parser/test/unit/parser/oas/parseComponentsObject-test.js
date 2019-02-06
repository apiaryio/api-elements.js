const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseComponentsObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Components Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides a warning when components is non-object', () => {
    const components = new namespace.elements.String();

    const parseResult = parse(context, components);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Components Object' is not an object");
  });

  describe('#schemas', () => {
    it('provides a warning when schemas is non-object', () => {
      const components = new namespace.elements.Object({
        schemas: '',
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' 'schemas' is not an object");
    });

    it('parses valid schemas into data structures', () => {
      const components = new namespace.elements.Object({
        schemas: {
          User: {
            type: 'object',
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const schemas = parsedComponents.get('schemas');
      expect(schemas).to.be.instanceof(namespace.elements.Object);
      expect(schemas.get('User')).to.be.instanceof(namespace.elements.DataStructure);
    });
  });

  describe('#parameters', () => {
    it('provides a warning when parameters is non-object', () => {
      const components = new namespace.elements.Object({
        parameters: '',
      });

      const parseResult = parse(context, components);
      expect(parseResult).to.contain.warning("'Components Object' 'parameters' is not an object");
    });

    it('parses valid parameters', () => {
      const components = new namespace.elements.Object({
        parameters: {
          limitParam: {
            name: 'limit',
            in: 'query',
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const parameters = parsedComponents.get('parameters');
      expect(parameters).to.be.instanceof(namespace.elements.Object);
      expect(parameters.get('limitParam')).to.be.instanceof(namespace.elements.Member);
      expect(parameters.get('limitParam').key.toValue()).to.equal('limit');
    });

    it('parses unsupported parameters', () => {
      const components = new namespace.elements.Object({
        parameters: {
          limitParam: {
            name: 'limit',
            in: 'cookie',
          },
        },
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Parameter Object' 'in' 'cookie' is unsupported");

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const parameters = parsedComponents.get('parameters');
      expect(parameters).to.be.instanceof(namespace.elements.Object);
      expect(parseResult.length).to.equal(2);

      const parameter = parameters.getMember('limitParam');
      expect(parameter).to.be.instanceof(namespace.elements.Member);
      expect(parameter.value).to.be.undefined;
    });
  });

  describe('#responses', () => {
    it('provides a warning when responses is non-object', () => {
      const components = new namespace.elements.Object({
        responses: '',
      });

      const parseResult = parse(context, components);
      expect(parseResult).to.contain.warning("'Components Object' 'responses' is not an object");
    });

    it('parses valid responses', () => {
      const components = new namespace.elements.Object({
        responses: {
          ErrorResponse: {
            description: 'an error response',
            content: {
              'application/json': {},
              'application/xml': {},
            },
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const responses = parsedComponents.get('responses');
      expect(responses).to.be.instanceof(namespace.elements.Object);

      expect(responses.length).to.equal(2);

      const response1 = responses.content[0];
      const response2 = responses.content[1];

      expect(response1.key.toValue()).to.equal('ErrorResponse');
      expect(response2.key.toValue()).to.equal('ErrorResponse');

      expect(response1.value).to.be.instanceof(namespace.elements.HttpResponse);
      expect(response2.value).to.be.instanceof(namespace.elements.HttpResponse);
    });
  });

  describe('#requestBodies', () => {
    it('provides a warning when requestBodies is not an object', () => {
      const components = new namespace.elements.Object({
        requestBodies: '',
      });

      const parseResult = parse(context, components);
      expect(parseResult).to.contain.warning("'Components Object' 'requestBodies' is not an object");
    });

    it('parses valid requestBodies', () => {
      const components = new namespace.elements.Object({
        requestBodies: {
          ExampleRequest: {
            content: {
              'application/json': {},
              'application/xml': {},
            },
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const requests = parsedComponents.get('requestBodies');
      expect(requests).to.be.instanceof(namespace.elements.Object);

      expect(requests.length).to.equal(2);

      const request1 = requests.content[0];
      const request2 = requests.content[1];

      expect(request1.key.toValue()).to.equal('ExampleRequest');
      expect(request2.key.toValue()).to.equal('ExampleRequest');

      expect(request1.value).to.be.instanceof(namespace.elements.HttpRequest);
      expect(request1.value.contentType.toValue()).to.equal('application/json');
      expect(request2.value).to.be.instanceof(namespace.elements.HttpRequest);
      expect(request2.value.contentType.toValue()).to.equal('application/xml');
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported examples key', () => {
      const components = new namespace.elements.Object({
        examples: {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' contains unsupported key 'examples'");
    });

    it('provides warning for unsupported headers key', () => {
      const components = new namespace.elements.Object({
        headers: {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' contains unsupported key 'headers'");
    });

    it('provides warning for unsupported securitySchemes key', () => {
      const components = new namespace.elements.Object({
        securitySchemes: {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' contains unsupported key 'securitySchemes'");
    });

    it('provides warning for unsupported links key', () => {
      const components = new namespace.elements.Object({
        links: {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' contains unsupported key 'links'");
    });

    it('provides warning for unsupported callbacks key', () => {
      const components = new namespace.elements.Object({
        callbacks: {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' contains unsupported key 'callbacks'");
    });

    it('does not provide warning for Info Object extensions', () => {
      const components = new namespace.elements.Object({
        'x-extension': {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.not.contain.annotations;
    });

    it('provides warning for invalid keys', () => {
      const components = new namespace.elements.Object({
        invalid: {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' contains invalid key 'invalid'");
    });
  });
});
