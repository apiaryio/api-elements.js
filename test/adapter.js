/* eslint-disable no-unused-expressions */
/*
 * Tests for API Blueprint adapter.
 */

import { expect } from 'chai';
import { parse, detect } from '../src/adapter';

describe('API Blueprint parser adapter', () => {
  context('detection', () => {
    it('detects FORMAT: 1A', () => {
      expect(detect('FORMAT: 1A\n# My API')).to.be.true;
    });

    it('works with unicode BOM', () => {
      expect(detect('\uFEFFFORMAT: 1A\n')).to.be.true;
    });

    it('ignores other data', () => {
      expect(detect('{"title": "Not APIB!"}')).to.be.false;
    });
  });

  context('can parse API Blueprint', () => {
    let result;

    before((done) => {
      const source = 'FORMAT: 1A\n# My API\n## Foo [/foo]\n';
      parse({ source }, (err, output) => {
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
      expect(filtered[0]).to.be.an.object;
    });
  });

  it('can parse an API Blueprint with require blueprint name', (done) => {
    const source = '# GET /\n+ Response 204\n';

    parse({ source, requireBlueprintName: true }, (err, output) => {
      expect(err).not.to.be.null;
      expect(output.content[0].element).to.equal('annotation');
      done();
    });
  });
});
