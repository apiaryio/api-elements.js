/* eslint-disable no-unused-expressions */
/* eslint-disable no-loop-func */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/*
 * Tests for Swagger adapter.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import fury from 'fury';
import swaggerZoo from 'swagger-zoo';
import { expect } from 'chai';
import adapter, { detect } from '../src/adapter';

fury.adapters = [adapter];

function testFixture(description, fixture, generateSourceMap = false) {
  it(description, (done) => {
    const source = fixture.swagger;
    let expected;

    if (generateSourceMap) {
      expected = fixture.apiElementsSourceMap;
    } else {
      expected = fixture.apiElements;
    }

    fury.parse({ source, generateSourceMap }, (err, output) => {
      if (err && !output) {
        return done(err);
      }

      output.freeze();

      // Invoke with the env var GENERATE set to regenerate the fixtures.
      if (process.env.GENERATE) {
        expected = fury.minim.toRefract(output);

        if (generateSourceMap) {
          // eslint-disable-next-line no-param-reassign
          fixture.apiElementsSourceMap = expected;
        } else {
          // eslint-disable-next-line no-param-reassign
          fixture.apiElements = expected;
        }
      }

      expect(fury.minim.toRefract(output)).to.deep.equal(expected);
      return done();
    });
  });
}

describe('Swagger 2.0 adapter', () => {
  context('detection', () => {
    it('detects JSON', () => {
      expect(detect('"swagger": "2.0"')).to.be.true;
    });

    it('detects YAML', () => {
      expect(detect('swagger: "2.0"')).to.be.true;
    });

    it('detects object', () => {
      expect(detect({ swagger: '2.0' })).to.be.true;
    });

    it('works with single quotes', () => {
      expect(detect('swagger: \'2.0\'')).to.be.true;
    });

    it('works with extra spacing', () => {
      expect(detect('swagger:  \t "2.0"')).to.be.true;
    });

    it('ignores other data', () => {
      expect(detect('{"title": "Not Swagger!"}')).to.be.false;
    });
  });

  context('can parse Swagger object', () => {
    const source = { swagger: '2.0', info: { title: 'Test', version: '1.0' } };
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
      const filtered = result.filter(item =>
        item.element === 'category' && item.classes.contains('api'));

      expect(filtered).to.have.length(1);
      expect(filtered.first).to.be.an('object');
    });
  });

  context('cannot parse invalid Swagger YAML', () => {
    const source = 'swagger: "2.0"\nbad: }';

    it('returns error for bad input yaml', (done) => {
      fury.parse({ source }, (err, parseResult) => {
        expect(err).to.exist;
        expect(parseResult).to.exist;
        expect(parseResult.errors.isEmpty).to.be.false;
        expect(parseResult.warnings.isEmpty).to.be.true;
        done();
      });
    });

    it('returns error for bad input yaml with source maps', (done) => {
      fury.parse({ source, generateSourceMap: true }, (err, parseResult) => {
        expect(err).to.exist;
        expect(parseResult).to.exist;
        expect(parseResult.errors.isEmpty).to.be.false;
        expect(parseResult.warnings.isEmpty).to.be.true;
        done();
      });
    });
  });

  describe('can parse fixtures', () => {
    const fixtures = swaggerZoo.features();
    fixtures.forEach((fixture) => {
      testFixture(`Parses ${fixture.name}`, fixture);
      testFixture(`Parses ${fixture.name} with source maps`, fixture, true);
    });
  });

  describe('can parse regression fixtures', () => {
    const files = glob.sync(path.join(__dirname, 'fixtures', '*.yaml'));

    files.forEach((file) => {
      const name = path.basename(file, path.extname(file));

      const swagger = fs.readFileSync(file, 'utf-8');
      const apiElementsPath = path.join(__dirname, 'fixtures', `${name}.json`);

      const options = { swagger };

      Object.defineProperty(options, 'apiElements', {
        get() {
          return require(apiElementsPath);
        },

        set(value) {
          fs.writeFileSync(apiElementsPath, JSON.stringify(value, null, 2));
          return value;
        },
      });

      testFixture(`Parses ${name}`, options);
    });
  });
});
