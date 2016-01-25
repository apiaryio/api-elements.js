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

function testFixture(description, filename, subDir = true, generateSourceMap = false) {
  it(description, (done) => {
    const source = fs.readFileSync(filename, 'utf8');
    let base = 'fixtures';

    if (subDir) {
      base = path.join(base, 'refract');
    }

    const expectedName = './' + path.join(base, path.basename(filename, path.extname(filename)) + '.json');
    let expected = require(expectedName);

    fury.parse({source, generateSourceMap}, (err, output) => {
      if (err && !output) {
        return done(err);
      }

      // Invoke with the env var GENERATE set to regenerate the fixtures.
      if (process.env.GENERATE) {
        expected = output.toRefract();
        fs.writeFileSync(path.join(__dirname, expectedName), JSON.stringify(expected, null, 2), 'utf8');
      }

      expect(output.toRefract()).to.deep.equal(expected);
      done();
    });
  });
}

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
    const source = {swagger: '2.0', info: {title: 'Test', version: '1.0'}};
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

  context('cannot parse invalid Swagger YAML', () => {
    const source = 'swagger: "2.0"\nbad: }';
    let parseError;
    let parseResult;

    before((done) => {
      fury.parse({source}, (err, result) => {
        parseError = err;
        parseResult = result;
        done();
      });
    });

    it('returns error for bad input yaml', () => {
      expect(parseError).to.exist;
      expect(parseResult).to.exist;
    });
  });

  context('source maps & annotations', () => {
    testFixture('can generate source maps', './test/fixtures/sourcemaps.yaml', false, true);
    testFixture('can generate annotations', './test/fixtures/annotations.yaml', false);
  });

  describe('can parse fixtures', () => {
    const filenames = glob.sync('./test/fixtures/swagger/*.@(json|yaml)');
    filenames.forEach((filename) => {
      testFixture(`Parses ${path.basename(filename, path.extname(filename))}`, filename);
    });
  });
});
