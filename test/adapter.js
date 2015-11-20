/*
 * Tests for Swagger adapter.
 */

import adapter from '../src/adapter';
import fs from 'fs';
import fury from 'fury';
import glob from 'glob';
import path from 'path';

import {expect} from 'chai';

fury.adapters = [adapter];

describe('Swagger 2.0 adapter', () => {
  context('detection', () => {
    it('detects JSON', () => {
      expect(adapter.detect('"swagger": "2.0"')).to.be.true;
    });

    it('detects YAML', () => {
      expect(adapter.detect('swagger: "2.0"')).to.be.true;
    });

    it('detects object', () => {
      expect(adapter.detect({swagger: '2.0'})).to.be.true;
    });

    it('works with single quotes', () => {
      expect(adapter.detect('swagger: \'2.0\'')).to.be.true;
    });

    it('works with extra spacing', () => {
      expect(adapter.detect('swagger:  \t "2.0"')).to.be.true;
    });

    it('ignores other data', () => {
      expect(adapter.detect('{"title": "Not Swagger!"}')).to.be.false;
    });
  });

  context('can parse Swagger object', () => {
    const source = {swagger: '2.0', info: {title: 'Test'}};
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

    it('has parseResult element', () => {
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

  describe('can parse fixtures', () => {
    const filenames = glob.sync('./test/fixtures/swagger/*.@(json|yaml)');
    filenames.forEach((filename) => {
      it(`Parses ${path.basename(filename, path.extname(filename))}`, (done) => {
        const source = fs.readFileSync(filename, 'utf8');
        const expected = require('./' + path.join('fixtures', 'refract', path.basename(filename, path.extname(filename)) + '.json'));

        fury.parse({source}, (err, output) => {
          if (err) {
            return done(err);
          }

          expect(output.toRefract()).to.deep.equal(expected);
          done();
        });
      });
    });
  });
});
