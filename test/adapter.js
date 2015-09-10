/*
 * Tests for API Blueprint adapter.
 */

import {expect} from 'chai';
import adapter from '../src/adapter';

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
      adapter.parse({source}, (err, output) => {
        if (err) {
          return done(err);
        }

        result = output;
        done();
      });
    });

    it('has parseResult element', () => {
      expect(result.element).to.equal('parseResult');
    });

    it('has API category inside parse result', () => {
      const filtered = result.content.filter(item =>
        item.element === 'category' && item.meta.classes.indexOf('api') !== -1
      );

      expect(filtered).to.have.length(1);
      expect(filtered[0]).to.be.an.object;
    });
  });
});
