const { Fury } = require('@apielements/core');
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

  it('provides an error when a reusable component is named after an element', () => {
    const components = new namespace.elements.Object({
      schemas: {
        member: {},
      },
    });

    const parseResult = parse(context, components);

    expect(parseResult).to.contain.error(
      "'Components Object' 'schemas' contains a reserved key 'member' which is not currently supported by this parser"
    );
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

    it('parses invalid schema into empty member', () => {
      const components = new namespace.elements.Object({
        schemas: {
          User: null,
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(2);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const schemas = parsedComponents.get('schemas');
      expect(schemas).to.be.instanceof(namespace.elements.Object);

      const member = schemas.getMember('User');
      expect(member).to.be.instanceof(namespace.elements.Member);
      expect(member.value).to.be.undefined;
    });

    it('parses invalid schema into empty member and leaves schemas state', () => {
      const components = new namespace.elements.Object({
        schemas: {
          User: { type: 'array', items: { $ref: '#/foo' } },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      expect(parseResult).to.contain.error(
        "Only local references to '#/components' within the same file are supported"
      );

      const schemasState = context.state.components.get('schemas');
      const userState = schemasState.getMember('User');
      expect(userState).to.be.instanceof(namespace.elements.Member);
      expect(userState.value).to.be.undefined;
    });

    it('parses valid schemas with alias into data structures', () => {
      const components = new namespace.elements.Object({
        schemas: {
          User: {
            type: 'object',
          },
          UserAlias: { $ref: '#/components/schemas/User' },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const schemas = parsedComponents.get('schemas');
      expect(schemas).to.be.instanceof(namespace.elements.Object);

      const userSchema = schemas.get('User');
      expect(userSchema).to.be.instanceof(namespace.elements.DataStructure);
      expect(userSchema.content).to.be.instanceof(namespace.elements.Object);

      const userSchemaAlias = schemas.get('UserAlias');
      expect(userSchemaAlias).to.be.instanceof(namespace.elements.DataStructure);
      expect(userSchemaAlias.content.element).to.equal('User');
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

  describe('#pathItems', () => {
    it('provides a warning when using OpenAPI < 3.1', () => {
      const components = new namespace.elements.Object({
        pathItems: {},
      });

      const parseResult = parse(context, components);
      expect(parseResult).to.contain.warning("'Components Object' contains invalid key 'pathItems'");
    });

    it('provides an unsupported warning when using OpenAPI >= 3.1', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const components = new namespace.elements.Object({
        pathItems: {},
      });

      const parseResult = parse(context, components);
      expect(parseResult).to.contain.warning("'Components Object' contains unsupported key 'pathItems'");
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

  describe('#headers', () => {
    it('parses empty headers', () => {
      const components = new namespace.elements.Object({
        headers: {},
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.not.contain.annotations;
    });

    it('provides warning when headers is non-object', () => {
      const components = new namespace.elements.Object({
        headers: 'dummy',
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Components Object' 'headers' is not an object");
    });

    it('provide warning when header is non-object', () => {
      const components = new namespace.elements.Object({
        headers: {
          header: 'dummy',
        },
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.contain.warning("'Header Object' is not an object");
    });

    it('parses headers', () => {
      const components = new namespace.elements.Object({
        headers: {
          header1: {},
          header2: {},
        },
      });

      const parseResult = parse(context, components);

      expect(parseResult).to.not.contain.annotations;
      expect(parseResult.length).is.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const headers = parsedComponents.get('headers');
      expect(headers).to.be.instanceof(namespace.elements.Object);
      expect(headers.length).to.be.equal(2);

      const header1 = headers.content[0];
      const header2 = headers.content[1];

      expect(header1.key.toValue()).to.equal('header1');
      expect(header2.key.toValue()).to.equal('header2');

      expect(header1.value).to.be.instanceof(namespace.elements.String);
      expect(header1.value.toValue()).to.be.undefined;

      expect(header2.value).to.be.instanceof(namespace.elements.String);
      expect(header2.value.toValue()).to.be.undefined;
    });
  });

  describe('#securitySchemes', () => {
    it('provides a warning when securitySchemes is not an object', () => {
      const components = new namespace.elements.Object({
        securitySchemes: '',
      });

      const parseResult = parse(context, components);
      expect(parseResult).to.contain.warning("'Components Object' 'securitySchemes' is not an object");
    });

    it('parses valid securitySchemes', () => {
      const components = new namespace.elements.Object({
        securitySchemes: {
          token: {
            type: 'apiKey',
            name: 'example',
            in: 'query',
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const securitySchemes = parsedComponents.get('securitySchemes');
      expect(securitySchemes).to.be.instanceof(namespace.elements.Array);
      expect(securitySchemes.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(securitySchemes.get(0).id.toValue()).to.equal('token');
    });

    it('parses oauth2 securityScheme with multiple flows', () => {
      const components = new namespace.elements.Object({
        securitySchemes: {
          oauth: {
            type: 'oauth2',
            flows: {
              password: {
                tokenUrl: '/token',
                scopes: {},
              },
              implicit: {
                authorizationUrl: '/authorization',
                scopes: {},
              },
            },
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const securitySchemes = parsedComponents.get('securitySchemes');
      expect(securitySchemes).to.be.instanceof(namespace.elements.Array);
      expect(securitySchemes.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(securitySchemes.get(0).id.toValue()).to.equal('oauth resource owner password credentials');
      expect(securitySchemes.get(1)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(securitySchemes.get(1).id.toValue()).to.equal('oauth implicit');
    });

    it('provides warning when oauth2 flow scheme name is already used', () => {
      const components = new namespace.elements.Object({
        securitySchemes: {
          'oauth implicit': {
            type: 'http',
            scheme: 'basic',
          },
          oauth: {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: '/authorization',
                scopes: {},
              },
            },
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'oauth implicit' security scheme can't be created from 'oauth' security scheme because it is already defined");

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const securitySchemes = parsedComponents.get('securitySchemes');
      expect(securitySchemes).to.be.instanceof(namespace.elements.Array);
      expect(securitySchemes.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(securitySchemes.get(0).id.toValue()).to.equal('oauth implicit');
    });

    it('provides warning when scheme name is already used by oauth2 flow', () => {
      const components = new namespace.elements.Object({
        securitySchemes: {
          oauth: {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: '/authorization',
                scopes: {},
              },
            },
          },
          'oauth implicit': {
            type: 'http',
            scheme: 'basic',
          },
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'oauth implicit' security scheme is already defined");

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const securitySchemes = parsedComponents.get('securitySchemes');
      expect(securitySchemes).to.be.instanceof(namespace.elements.Array);
      expect(securitySchemes.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(securitySchemes.get(0).id.toValue()).to.equal('oauth implicit');
    });

    it('handles invalid security scheme', () => {
      const components = new namespace.elements.Object({
        securitySchemes: {
          Basic: null,
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(2);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);
      expect(parsedComponents.get('securitySchemes')).to.be.undefined;
    });
  });

  describe('#examples', () => {
    it('provides a warning when parameters is non-object', () => {
      const components = new namespace.elements.Object({
        examples: '',
      });

      const parseResult = parse(context, components);
      expect(parseResult).to.contain.warning("'Components Object' 'examples' is not an object");
    });

    it('parses examples', () => {
      const components = new namespace.elements.Object({
        examples: {
          foo: {},
        },
      });

      const parseResult = parse(context, components);
      expect(parseResult.length).to.equal(1);

      const parsedComponents = parseResult.get(0);
      expect(parsedComponents).to.be.instanceof(namespace.elements.Object);

      const examples = parsedComponents.get('examples');
      expect(examples).to.be.instanceof(namespace.elements.Object);
      expect(examples.getMember('foo')).to.be.instanceof(namespace.elements.Member);
    });
  });

  describe('warnings for unsupported properties', () => {
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
