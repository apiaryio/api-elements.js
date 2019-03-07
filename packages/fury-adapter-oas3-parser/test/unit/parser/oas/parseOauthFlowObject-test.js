const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseOauthFlowObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Oauth Flow Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when oauth flow is not an object', () => {
    const oauthFlow = new namespace.elements.String();

    const parseResult = parse(context, oauthFlow);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Oauth Flow Object' is not an object");
  });

  describe('#scopes', () => {
    it('provides a warning when scopes does not exist', () => {
      const oauthFlow = new namespace.elements.Object({
      });

      const parseResult = parse(context, oauthFlow);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Oauth Flow Object' is missing required property 'scopes'");
    });

    it('provides a  warning when scopes is not an object', () => {
      const oauthFlow = new namespace.elements.Object({
        scopes: 1,
      });

      const parseResult = parse(context, oauthFlow);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.warning("'Oauth Flow Object' 'scopes' is not an object");
    });

    it('provides a warning when scopes value item is not a string', () => {
      const oauthFlow = new namespace.elements.Object({
        scopes: {
          read: 1,
        },
      });

      const parseResult = parse(context, oauthFlow);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Oauth Flow Object' 'scopes' 'read' is not a string");

      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);
      expect(parseResult.get(0).get('scopes')).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).get('scopes').length).to.equal(0);
    });

    it('parses scopes correctly', () => {
      const oauthFlow = new namespace.elements.Object({
        scopes: {
          read: 'description',
        },
      });

      const parseResult = parse(context, oauthFlow);

      expect(parseResult.length).to.equal(1);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);

      const scopes = parseResult.get(0).get('scopes');

      expect(scopes).to.be.instanceof(namespace.elements.Array);
      expect(scopes.length).to.equal(1);

      expect(scopes.get(0)).to.be.instanceof(namespace.elements.String);
      expect(scopes.get(0).toValue()).to.equal('read');
      expect(scopes.get(0).description).to.not.be.undefined;
      expect(scopes.get(0).description.toValue()).to.equal('description');
    });
  });

  describe('#refreshUrl', () => {
    it('provides an warning when refreshUrl is not a string', () => {
      const oauthFlow = new namespace.elements.Object({
        scopes: {},
        refreshUrl: 1,
      });

      const parseResult = parse(context, oauthFlow);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Oauth Flow Object' 'refreshUrl' is not a string");

      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);
      expect(parseResult.get(0).get('scopes')).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).get('scopes').length).to.equal(0);
    });
  });

  describe('#tokenUrl', () => {
    it('provides an warning when tokenUrl is not a string', () => {
      const oauthFlow = new namespace.elements.Object({
        scopes: {},
        tokenUrl: 1,
      });

      const parseResult = parse(context, oauthFlow);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Oauth Flow Object' 'tokenUrl' is not a string");

      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);
      expect(parseResult.get(0).get('scopes')).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).get('scopes').length).to.equal(0);
    });
  });

  describe('#authorizationUrl', () => {
    it('provides an warning when authorizationUrl is not a string', () => {
      const oauthFlow = new namespace.elements.Object({
        scopes: {},
        authorizationUrl: 1,
      });

      const parseResult = parse(context, oauthFlow);

      expect(parseResult.length).to.equal(2);
      expect(parseResult).to.contain.warning("'Oauth Flow Object' 'authorizationUrl' is not a string");

      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Object);
      expect(parseResult.get(0).get('scopes')).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).get('scopes').length).to.equal(0);
    });
  });

  it('provides warning for invalid keys', () => {
    const oauthFlow = new namespace.elements.Object({
      scopes: {},
      invalid: '',
    });

    const parseResult = parse(context, oauthFlow);

    expect(parseResult.length).to.equal(2);
    expect(parseResult).to.contain.warning("'Oauth Flow Object' contains invalid key 'invalid'");
  });
});
