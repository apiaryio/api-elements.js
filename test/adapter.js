/*
 * Tests for Swagger adapter.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import adapter from '../src/adapter';
import fury from 'fury';
import swaggerZoo from 'swagger-zoo';

import {expect} from 'chai';

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

    fury.parse({source, generateSourceMap}, (err, output) => {
      if (err && !output) {
        return done(err);
      }

      // Invoke with the env var GENERATE set to regenerate the fixtures.
      if (process.env.GENERATE) {
        expected = output.toRefract();

        if (generateSourceMap) {
          fixture.apiElementsSourceMap = expected;
        } else {
          fixture.apiElements = expected;
        }
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

  describe('can parse fixtures', () => {
    const fixtures = swaggerZoo.features();
    fixtures.forEach((fixture) => {
      testFixture(`Parses ${fixture.name}`, fixture);
      testFixture(`Parses ${fixture.name} with source maps`, fixture, true);
    });
  });

  describe('can parse regression fixtures', () => {
    const files = glob.sync(path.join(__dirname, 'fixtures', '*.yaml'));

    /* eslint-disable no-loop-func,func-names */
    for (const file of files) {
      const name = path.basename(file, path.extname(file));

      const swagger = fs.readFileSync(file, 'utf-8');
      const apiElementsPath = path.join(__dirname, 'fixtures', `${name}.json`);

      const options = {swagger};

      Object.defineProperty(options, 'apiElements', {
        get: function() {
          return require(apiElementsPath);
        },

        set: function(value) {
          fs.writeFileSync(apiElementsPath, JSON.stringify(value, null, 2));
          return value;
        },
      });

      testFixture(`Parses ${name}`, options);
    }
    /* eslint-enable no-loop-func,func-names */
  });
});
