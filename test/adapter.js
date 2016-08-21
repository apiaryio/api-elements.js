import {expect} from 'chai';

import adapter from '../src/adapter';
import fury from 'fury';

fury.adapters = [adapter];

describe('Apiary Blueprint Parser Adapter', () => {
  context('detection', () => {
    it('detects an Apiary Blueprint', () => {
      const blueprint = '--- Sample Title ---';
      expect(adapter.detect(blueprint)).to.be.true;
    });

    it('does not detect other data', () => {
      const blueprint = '# Sample Title';
      expect(adapter.detect(blueprint)).to.be.false;
    });
  });

  context('media types', () => {
    it('returns the text/vnd.legacyblueprint media type', () => {
      expect(adapter.mediaTypes).to.eql(['text/vnd.legacyblueprint']);
    });
  });

  context('parsing an Apiary Blueprint', () => {
    const source = '--- Sample Title ---';
    let result;

    before((done) => {
      fury.parse({source}, (err, output) => {
        if (err) {
          return done(err);
        }

        result = output;
        done();
      });
    });

    it('has a parseResult element', () => {
      expect(result.element).to.equal('parseResult');
    });

    it('has API category inside parse result', () => {
      const filtered = result.filter(item =>
        item.element === 'category' && item.classes.contains('api')
      );

      expect(filtered).to.have.length(1);
      expect(filtered[0]).to.be.an.object;
    });
  });
});
