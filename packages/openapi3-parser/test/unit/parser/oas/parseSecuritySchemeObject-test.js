const { Fury } = require('@apielements/core');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseSecuritySchemeObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Security Scheme Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when security scheme is not an object', () => {
    const securityScheme = new namespace.elements.String();

    const parseResult = parse(context, securityScheme);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Security Scheme Object' is not an object");
  });

  describe('#type', () => {
    it('provides an warning when type is not a string', () => {
      const securityScheme = new namespace.elements.Object({
        type: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'type' is not a string");
    });

    it('provides an warning when value is not a permitted value', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'space',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'type' must be either 'apiKey', 'http', 'oauth2' or 'openIdConnect'");
    });

    it('provides an unsupported warning for openIdConnect type', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'openIdConnect',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'type' 'openIdConnect' is unsupported");
    });

    it('provides an unsupported warning for mutalTLS type in OpenAPI >= 3.1', () => {
      context.openapiVersion = { major: 3, minor: 1 };
      const securityScheme = new namespace.elements.Object({
        type: 'mutalTLS',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'type' 'mutalTLS' is unsupported");
    });

    it('provides an invalid warning for mutalTLS type in OpenAPI 3.0', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'mutalTLS',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'type' must be either 'apiKey', 'http', 'oauth2' or 'openIdConnect'");
    });
  });

  describe('#name', () => {
    it('provides a warning when name does not exist', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        in: 'query',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' is missing required property 'name'");
    });

    it('provides a warning when name is not a string', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 1,
        in: 'query',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'name' is not a string");
    });
  });

  describe('#in', () => {
    it('provides a warning when in does not exist', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' is missing required property 'in'");
    });

    it('provides a warning when in is not a string', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'in' is not a string");
    });

    it('provides a warning when in is not a permitted value', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'space',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'in' must be either 'query', 'header' or 'cookie'");
    });
  });

  describe('#scheme', () => {
    it('provides a warning when scheme does not exist', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'http',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' is missing required property 'scheme'");
    });

    it('provides a warning when scheme is not a string', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'http',
        scheme: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'scheme' is not a string");
    });
  });

  describe('#description', () => {
    it('attaches description to member', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
        description: 'an example security scheme',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).description.toValue()).to.equal(
        'an example security scheme'
      );
    });

    it('provides a warning when description is not a string', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
        description: true,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'description' is not a string");
    });
  });

  describe('when type is apiKey', () => {
    it('parses correctly when in a header', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'header',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).element).to.equal('Token Authentication Scheme');

      const { members } = parseResult.get(0);

      expect(members.length).to.equal(1);
      expect(members.get(0).key.toValue()).to.equal('httpHeaderName');
      expect(members.get(0).value.toValue()).to.equal('example');
    });

    it('parses correctly when in a query', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).element).to.equal('Token Authentication Scheme');

      const { members } = parseResult.get(0);

      expect(members.length).to.equal(1);
      expect(members.get(0).key.toValue()).to.equal('queryParameterName');
      expect(members.get(0).value.toValue()).to.equal('example');
    });

    it('parses correctly when in a cookie', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'cookie',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).element).to.equal('Token Authentication Scheme');

      const { members } = parseResult.get(0);

      expect(members.length).to.equal(1);
      expect(members.get(0).key.toValue()).to.equal('cookieName');
      expect(members.get(0).value.toValue()).to.equal('example');
    });

    it('provides warning for invalid scheme', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
        scheme: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'apiKey' contains invalid key 'scheme'");
    });

    it('provides warning for invalid flows', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
        flows: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'apiKey' contains invalid key 'flows'");
    });
  });

  describe('when type is oauth2', () => {
    it('parses correctly when single flow', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'oauth2',
        flows: {
          password: {
            tokenUrl: '/token',
            scopes: {},
          },
        },
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).length).to.equal(1);
      expect(parseResult.get(0).get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).get(0).element).to.equal('Oauth2 Scheme');
    });

    it('parses correctly when multiple flows', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'oauth2',
        description: 'oauth2 implementation',
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
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).length).to.equal(2);
      expect(parseResult.get(0).get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).get(0).element).to.equal('Oauth2 Scheme');
      expect(parseResult.get(0).get(0).description.toValue()).to.equal('oauth2 implementation');
      expect(parseResult.get(0).get(1)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).get(1).element).to.equal('Oauth2 Scheme');
      expect(parseResult.get(0).get(1).description.toValue()).to.equal('oauth2 implementation');
    });

    it('provides warning for invalid name', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'oauth2',
        flows: {},
        name: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'oauth2' contains invalid key 'name'");
    });

    it('provides warning for invalid in', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'oauth2',
        flows: {},
        in: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'oauth2' contains invalid key 'in'");
    });

    it('provides warning for invalid scheme', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'oauth2',
        flows: {},
        scheme: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'oauth2' contains invalid key 'scheme'");
    });
  });

  describe('when type is http', () => {
    it('parses correctly when scheme is basic', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'http',
        scheme: 'basic',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.AuthScheme);
      expect(parseResult.get(0).element).to.equal('Basic Authentication Scheme');
      expect(parseResult.get(0).members.length).to.equal(0);
    });

    it('provides warning for invalid name', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'http',
        scheme: 'basic',
        name: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'http' contains invalid key 'name'");
    });

    it('provides warning for invalid in', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'http',
        scheme: 'basic',
        in: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'http' contains invalid key 'in'");
    });

    it('provides warning for invalid flows', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'http',
        scheme: 'basic',
        flows: 1,
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Security Scheme Object' 'http' contains invalid key 'flows'");
    });

    it('provides warning for invalid scheme', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'http',
        scheme: 'basic[',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning(
        "'Security Scheme Object' 'http' contains unsupported scheme 'basic[', supported schemes bearer, basic"
      );
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported bearerFormat property', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
        bearerFormat: '',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult).to.contain.warning("'Security Scheme Object' contains unsupported key 'bearerFormat'");
    });

    it('provides warning for unsupported openIdConnectUrl property', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
        openIdConnectUrl: '',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult).to.contain.warning("'Security Scheme Object' contains unsupported key 'openIdConnectUrl'");
    });

    it('does not provide warning/errors for extensions', () => {
      const securityScheme = new namespace.elements.Object({
        type: 'apiKey',
        name: 'example',
        in: 'query',
        'x-extension': '',
      });

      const parseResult = parse(context, securityScheme);

      expect(parseResult).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const securityScheme = new namespace.elements.Object({
      type: 'apiKey',
      name: 'example',
      in: 'query',
      invalid: '',
    });

    const parseResult = parse(context, securityScheme);

    expect(parseResult).to.contain.warning("'Security Scheme Object' contains invalid key 'invalid'");
  });
});
