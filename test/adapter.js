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

  context('parsing an Apiary Blueprint containing a syntax error', () => {
    const source = `--- Blueprint Name ---

---
Description
---

---
Section 1
Test Section 1
---
`;

    const expectedAnnotation = {
      element: 'annotation',
      meta: {
        classes: ['error'],
      },
      attributes: {
        sourceMap: [
          {
            element: 'sourceMap',
            meta: {},
            attributes: {},
            content: [
              [78, 1],
            ],
          },
        ],
      },
      content: 'Expected "COPY", "DELETE", "GET", "HEAD", "LOCK", "MKCOL", "MOVE", "OPTIONS", "PATCH", "POST", "PROPPATCH", "PUT" or "UNLOCK" but end of input found.',
    };

    let parseResult;
    let parseError;

    before((done) => {
      fury.parse({source}, (err, output) => {
        parseError = err;
        parseResult = output;
        done();
      });
    });

    it('has a parseResult element', () => {
      expect(parseResult).to.exist;
      expect(parseResult.element).to.equal('parseResult');
    });

    it('has an annotation element', () => {
      expect(parseResult.annotations).to.have.length(1);
      const annotation = parseResult.annotations.first().toRefract();
      expect(annotation).to.eql(expectedAnnotation);
    });

    it('has an error', () => {
      expect(parseError).to.exist;
    });
  });
});
