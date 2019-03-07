const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseOauthFlowsObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Oauth Flows Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when oauth flows is not an object', () => {
    const oauthFlows = new namespace.elements.String();

    const parseResult = parse(context, oauthFlows);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Oauth Flows Object' is not an object");
  });

  describe('#implicit', () => {
    it('provides warning when no authorizationUrl', () => {
      const oauthFlows = new namespace.elements.Object({
        implicit: {
          scopes: {},
        },
      });

      const parseResult = parse(context, oauthFlows);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).length).to.equal(0);
      expect(parseResult).to.contain.warning("'Oauth Flows Object' 'implicit' is missing required property 'authorizationUrl'");
    });

    it.skip('parses correctly', () => {
      const oauthFlows = new namespace.elements.Object({
        implicit: {
          authorizationUrl: '/authorize',
          scopes: {},
        },
      });

      const parseResult = parse(context, oauthFlows);
      console.log(JSON.stringify(parseResult, null, 2));
      expect(parseResult.length).to.equal(1);
    });
  });

  describe('#password', () => {
    it('provides warning when no tokenUrl', () => {
      const oauthFlows = new namespace.elements.Object({
        password: {
          scopes: {},
        },
      });

      const parseResult = parse(context, oauthFlows);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).length).to.equal(0);
      expect(parseResult).to.contain.warning("'Oauth Flows Object' 'password' is missing required property 'tokenUrl'");
    });
  });

  describe('#clientCredentials', () => {
    it('provides warning when no tokenUrl', () => {
      const oauthFlows = new namespace.elements.Object({
        clientCredentials: {
          scopes: {},
        },
      });

      const parseResult = parse(context, oauthFlows);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).length).to.equal(0);
      expect(parseResult).to.contain.warning("'Oauth Flows Object' 'clientCredentials' is missing required property 'tokenUrl'");
    });
  });

  describe('#authorizationCode', () => {
    it('provides warning when no authorizationUrl', () => {
      const oauthFlows = new namespace.elements.Object({
        authorizationCode: {
          scopes: {},
        },
      });

      const parseResult = parse(context, oauthFlows);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).length).to.equal(0);
      expect(parseResult).to.contain.warning("'Oauth Flows Object' 'authorizationCode' is missing required property 'authorizationUrl'");
    });

    it('provides warning when no tokenUrl', () => {
      const oauthFlows = new namespace.elements.Object({
        authorizationCode: {
          authorizationUrl: '/authorize',
          scopes: {},
        },
      });

      const parseResult = parse(context, oauthFlows);

      expect(parseResult.length).to.equal(2);
      expect(parseResult.get(0)).to.be.instanceof(namespace.elements.Array);
      expect(parseResult.get(0).length).to.equal(0);
      expect(parseResult).to.contain.warning("'Oauth Flows Object' 'authorizationCode' is missing required property 'tokenUrl'");
    });
  });

  // TODO: Multiple flows

  it('provides warning for invalid keys', () => {
    const oauthFlows = new namespace.elements.Object({
      invalid: '',
    });

    const parseResult = parse(context, oauthFlows);

    expect(parseResult.length).to.equal(2);
    expect(parseResult).to.contain.warning("'Oauth Flows Object' contains invalid key 'invalid'");
  });
});
