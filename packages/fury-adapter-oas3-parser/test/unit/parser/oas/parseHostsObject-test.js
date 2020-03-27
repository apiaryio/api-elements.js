const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseHostsObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseHostsObject', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  describe.only('executes----run', () => {
    it('test----', () => {
      const hosts = new namespace.elements.Object({
        servers: {
          url: 'https://{username}.gigantic-server.com',
          description: 'The production API server',
          variables: {
            username: {
              default: 'demo',
            },
          },
        },
      });

      const parseResult = parse(context, hosts);

      console.log('PS', parseResult);
      expect(parseResult.length).to.equal(1);
    });
  });
});
