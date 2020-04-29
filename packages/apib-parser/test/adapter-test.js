/*
 * Tests for API Blueprint adapter.
 */

const { Fury } = require('fury');
const { expect } = require('chai');
const adapter = require('../lib/adapter');

const fury = new Fury();
fury.use(adapter);

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
      const source = 'FORMAT: 1A\n# My API\n## Foo [/foo]\n';
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
      const filtered = result.children.filter(item => item.element === 'category' && item.classes.contains('api'));

      expect(filtered).to.have.length(1);
      expect(filtered.first).to.be.an('object');
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
});
