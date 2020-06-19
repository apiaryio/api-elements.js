/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/*
 * Tests for Swagger adapter.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const fury = require('@apielements/core');
const swaggerZoo = require('swagger-zoo');
const { expect } = require('chai');
const adapter = require('../lib/adapter');

const { detect } = adapter;

fury.adapters = [adapter];

function testFixture(description, fixture, adapterOptions) {
  it(description, (done) => {
    const source = fixture.swagger;
    let expected;

    if (adapterOptions && adapterOptions.generateSourceMap) {
      expected = fixture.apiElementsSourceMap;
    } else {
      expected = fixture.apiElements;
    }

    const mediaType = 'application/swagger+yaml';

    fury.parse({ source, mediaType, adapterOptions }, (err, output) => {
      if (err && !output) {
        return done(err);
      }

      output.freeze();

      // Invoke with the env var GENERATE set to regenerate the fixtures.
      if (process.env.GENERATE) {
        expected = fury.minim.toRefract(output);

        if (adapterOptions && adapterOptions.generateSourceMap) {
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

function testFixtureOptions(swaggerPath, apiElementsPath) {
  const swagger = fs.readFileSync(swaggerPath, 'utf-8');
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

  return options;
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

    it('works with JSON Swagger', () => {
      expect(detect('{ "swagger" : "2.0" }')).to.be.true;
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
      const filtered = result.filter(item => item.element === 'category' && item.classes.includes('api'));

      expect(filtered).to.have.length(1);
      expect(filtered.first).to.be.an('object');
    });
  });

  context('cannot parse invalid Swagger YAML', () => {
    const source = 'swagger: "2.0"\nbad: }';

    it('returns error parse result for bad input yaml', (done) => {
      fury.parse({ source }, (err, parseResult) => {
        expect(err).to.be.null;
        expect(parseResult).to.exist;
        expect(parseResult.errors.isEmpty).to.be.false;
        expect(parseResult.warnings.isEmpty).to.be.true;
        done();
      });
    });

    it('returns error parse result for bad input yaml with source maps', (done) => {
      fury.parse({ source, generateSourceMap: true }, (err, parseResult) => {
        expect(err).to.be.null;
        expect(parseResult).to.exist;
        expect(parseResult.errors.isEmpty).to.be.false;
        expect(parseResult.warnings.isEmpty).to.be.true;
        done();
      });
    });
  });

  describe('parsing the swagger key', () => {
    it('returns error parse result for object without swagger key', (done) => {
      const source = 'openapi: 3.0.0\ninfo: {title: hi, version: 0.1.0}\npaths: {}\n';

      fury.parse({ source, mediaType: 'application/swagger+yaml' }, (err, parseResult) => {
        expect(err).to.be.null;
        expect(parseResult).to.exist;
        expect(parseResult.api).to.be.undefined;
        expect(parseResult.errors.toValue()).to.deep.equal([
          'Missing required key "swagger"',
        ]);
        done();
      });
    });

    it('returns error parse result when swagger key is number', (done) => {
      const source = 'swagger: 2.0\ninfo: {title: hi, version: 0.1.0}\npaths: {}\n';

      fury.parse({ source, mediaType: 'application/swagger+yaml' }, (err, parseResult) => {
        expect(err).to.be.null;
        expect(parseResult).to.exist;
        expect(parseResult.api).to.be.undefined;
        expect(parseResult.errors.toValue()).to.deep.equal([
          'Swagger version number must be a string (e.g. "2.0") not a number.',
        ]);
        done();
      });
    });

    it('returns error parse result when swagger key is not 2.0 version', (done) => {
      const source = 'swagger: "1.0"\ninfo: {title: hi, version: 0.1.0}\npaths: {}\n';

      fury.parse({ source, mediaType: 'application/swagger+yaml' }, (err, parseResult) => {
        expect(err).to.be.null;
        expect(parseResult).to.exist;
        expect(parseResult.api).to.be.undefined;
        expect(parseResult.errors.toValue()).to.deep.equal([
          'Unrecognized Swagger version: 1.0. Expected 2.0',
        ]);
        done();
      });
    });
  });

  describe('can parse fixtures', () => {
    const fixtures = swaggerZoo.features();
    fixtures.forEach((fixture) => {
      testFixture(`Parses ${fixture.name}`, fixture);
      testFixture(`Parses ${fixture.name} with source maps`, fixture, { generateSourceMap: true });
    });
  });

  describe('can parse regression fixtures', () => {
    const files = glob.sync(path.join(__dirname, 'fixtures', '*.yaml'));

    files.forEach((swaggerPath) => {
      const name = path.basename(swaggerPath, path.extname(swaggerPath));

      const swagger = fs.readFileSync(swaggerPath, 'utf-8');
      const apiElementsPath = path.join(__dirname, 'fixtures', `${name}.json`);
      const apiElementsSourceMapPath = path.join(__dirname, 'fixtures', `${name}.sourcemap.json`);

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

      Object.defineProperty(options, 'apiElementsSourceMap', {
        get() {
          return require(apiElementsSourceMapPath);
        },

        set(value) {
          fs.writeFileSync(apiElementsSourceMapPath, JSON.stringify(value, null, 2));
          return value;
        },
      });

      testFixture(`Parses ${name}`, options);
      testFixture(`Parses ${name} with source maps`, options, { generateSourceMap: true });
      testFixture(`Parses ${name}`, testFixtureOptions(swaggerPath, apiElementsPath));
    });
  });

  describe('#adapterOptions', () => {
    describe('#generateMessageBody', () => {
      testFixture('generates message body by default', testFixtureOptions(
        path.join(__dirname, 'fixtures', 'json-body-generation.yaml'),
        path.join(__dirname, 'fixtures', 'options', 'generateMessageBody-true.json')
      ));

      testFixture('generates message body when generateMessageBody is true', testFixtureOptions(
        path.join(__dirname, 'fixtures', 'json-body-generation.yaml'),
        path.join(__dirname, 'fixtures', 'options', 'generateMessageBody-true.json')
      ), { generateMessageBody: true });

      testFixture('disables generating message body when requested', testFixtureOptions(
        path.join(__dirname, 'fixtures', 'json-body-generation.yaml'),
        path.join(__dirname, 'fixtures', 'options', 'generateMessageBody-false.json')
      ), { generateMessageBody: false });
    });

    describe('#generateMessageBodySchema', () => {
      testFixture('generates message body schema by default', testFixtureOptions(
        path.join(__dirname, 'fixtures', 'json-body-generation.yaml'),
        path.join(__dirname, 'fixtures', 'options', 'generateMessageBodySchema-true.json')
      ));

      testFixture('generates message body schema when generateMessageBodySchema is true', testFixtureOptions(
        path.join(__dirname, 'fixtures', 'json-body-generation.yaml'),
        path.join(__dirname, 'fixtures', 'options', 'generateMessageBodySchema-true.json')
      ), { generateMessageBodySchema: true });

      testFixture('disables generating message body schema when requested', testFixtureOptions(
        path.join(__dirname, 'fixtures', 'json-body-generation.yaml'),
        path.join(__dirname, 'fixtures', 'options', 'generateMessageBodySchema-false.json')
      ), { generateMessageBodySchema: false });
    });
  });
});
