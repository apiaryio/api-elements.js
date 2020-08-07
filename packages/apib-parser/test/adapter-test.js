/*
 * Tests for API Blueprint adapter.
 */

const { Fury } = require('@apielements/core');
const { expect } = require('chai');
const adapter = require('../lib/adapter');

const fury = new Fury();
fury.use(adapter);

const source = `
# GET /
+ Response 200 (application/json)
    + Attributes
        + message: Hello World
`;


describe('API Blueprint parser adapter', () => {
  context('detection', () => {
    it('detects FORMAT: 1A', () => {
      expect(adapter.detect('FORMAT: 1A\n# My API')).to.be.true;
    });

    it('works with unicode BOM', () => {
      expect(adapter.detect('\uFEFFFORMAT: 1A\n')).to.be.true;
    });

    it('ignores other data', () => {
      expect(adapter.detect('{"title": "Not APIB!"}')).to.be.false;
    });
  });

  context('can parse API Blueprint', () => {
    let result;

    before((done) => {
      fury.parse({ source }, (err, output) => {
        if (err) {
          return done(err);
        }

        result = output;
        return done();
      });
    });

    it('has parseResult element', () => {
      expect(result.element).to.equal('parseResult');
    });

    it('has API category inside parse result', () => {
      const filtered = result.children.filter(
        item => item.element === 'category' && item.classes.includes('api')
      );

      expect(filtered).to.have.length(1);
      expect(filtered.first).to.be.an('object');
    });

    it('has the format link', () => {
      const link = result.links.get(0);

      expect(link.relation.toValue()).to.equal('via');
      expect(link.title.toValue()).to.equal('Apiary Blueprint');
      expect(link.href.toValue()).to.equal(
        'https://apiary.io/blueprint'
      );
    });
  });

  it('can parse an API Blueprint with require blueprint name', (done) => {
    const source = '# GET /\n+ Response 204\n';

    fury.parse({ source, adapterOptions: { requireBlueprintName: true } }, (err, parseResult) => {
      expect(err).to.be.null;
      expect(parseResult.length).to.equal(1);
      expect(parseResult.errors.length).to.equal(1);
      done();
    });
  });

  describe('generateMessageBody option', () => {
    it('should generate message bodies when generateMessageBody is not set', (done) => {
      fury.parse({ source }, (error, parseResult) => {
        expect(error).to.be.null;

        const resource = parseResult.api.resources.get(0);
        const transaction = resource.transitions.get(0).transactions.get(0);
        const { response } = transaction;

        expect(response.messageBody).to.be.instanceof(fury.minim.elements.Asset);
        expect(response.messageBodySchema).to.be.instanceof(fury.minim.elements.Asset);

        done();
      });
    });

    it('should generate message bodies when generateMessageBody is enabled', (done) => {
      fury.parse({ source, adapterOptions: { generateMessageBody: true } }, (error, parseResult) => {
        expect(error).to.be.null;

        const resource = parseResult.api.resources.get(0);
        const transaction = resource.transitions.get(0).transactions.get(0);
        const { response } = transaction;

        expect(response.messageBody).to.be.instanceof(fury.minim.elements.Asset);
        expect(response.messageBodySchema).to.be.instanceof(fury.minim.elements.Asset);

        done();
      });
    });

    it('should not generate message bodies when generateMessageBody is disabled', (done) => {
      fury.parse({ source, adapterOptions: { generateMessageBody: false } }, (error, parseResult) => {
        expect(error).to.be.null;

        const resource = parseResult.api.resources.get(0);
        const transaction = resource.transitions.get(0).transactions.get(0);
        const { response } = transaction;

        expect(response.messageBody).to.be.undefined;
        expect(response.messageBodySchema).to.be.instanceof(fury.minim.elements.Asset);

        done();
      });
    });
  });

  describe('generateMessageBodySchema option', () => {
    it('should generate message bodies when generateMessageBodySchema is not set', (done) => {
      fury.parse({ source }, (error, parseResult) => {
        expect(error).to.be.null;

        const resource = parseResult.api.resources.get(0);
        const transaction = resource.transitions.get(0).transactions.get(0);
        const { response } = transaction;

        expect(response.messageBody).to.be.instanceof(fury.minim.elements.Asset);
        expect(response.messageBodySchema).to.be.instanceof(fury.minim.elements.Asset);

        done();
      });
    });

    it('should generate message bodies when generateMessageBodySchema is enabled', (done) => {
      fury.parse({ source, adapterOptions: { generateMessageBodySchema: true } }, (error, parseResult) => {
        expect(error).to.be.null;

        const resource = parseResult.api.resources.get(0);
        const transaction = resource.transitions.get(0).transactions.get(0);
        const { response } = transaction;

        expect(response.messageBody).to.be.instanceof(fury.minim.elements.Asset);
        expect(response.messageBodySchema).to.be.instanceof(fury.minim.elements.Asset);

        done();
      });
    });

    it('should not generate message bodies when generateMessageBodySchema is disabled', (done) => {
      fury.parse({ source, adapterOptions: { generateMessageBodySchema: false } }, (error, parseResult) => {
        expect(error).to.be.null;

        const resource = parseResult.api.resources.get(0);
        const transaction = resource.transitions.get(0).transactions.get(0);
        const { response } = transaction;

        expect(response.messageBody).to.be.instanceof(fury.minim.elements.Asset);
        expect(response.messageBodySchema).to.be.undefined;

        done();
      });
    });
  });
});
