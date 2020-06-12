const { expect } = require('chai');
const { Fury } = require('@apielements/core');

const adapter = require('../../lib/adapter');

describe('Adapter', () => {
  it('has a name', () => {
    expect(adapter.name).to.equal('oas3');
  });

  it('has OpenAPI media types', () => {
    expect(adapter.mediaTypes).to.deep.equal([
      'application/vnd.oai.openapi',
      'application/vnd.oai.openapi+json',
    ]);
  });

  describe('detection', () => {
    it('can detect OpenAPI 3.0.0 YAML document', () => {
      const source = 'openapi: "3.0.0"';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.0 JSON document', () => {
      const source = '{"openapi": "3.0.0"}';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.1 YAML document', () => {
      const source = 'openapi: "3.0.1"';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.1 JSON document', () => {
      const source = '{"openapi": "3.0.1"}';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.1.0 YAML document', () => {
      const source = 'openapi: "3.1.0"';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.1 JSON document', () => {
      const source = '{"openapi": "3.1.0"}';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.0 YAML document without version quotes', () => {
      expect(adapter.detect('openapi: 3.0.0')).to.be.true;
      expect(adapter.detect('\'openapi\': 3.0.0')).to.be.true;
      expect(adapter.detect('"openapi": 3.0.0')).to.be.true;
      expect(adapter.detect('openapi: 3.1.0')).to.be.true;
      expect(adapter.detect('\'openapi\': 3.1.0')).to.be.true;
      expect(adapter.detect('"openapi": 3.1.0')).to.be.true;
      expect(adapter.detect('openapi: 3.0.1')).to.be.true;
      expect(adapter.detect('\'openapi\': 3.0.1')).to.be.true;
      expect(adapter.detect('"openapi": 3.0.1')).to.be.true;
    });

    it('does not detect Swagger 2 YAML document', () => {
      const source = 'swagger: "2.0"';

      expect(adapter.detect(source)).to.be.false;
    });

    it('does not detect Swagger 2 JSON document', () => {
      const source = '{"swagger": "2.0"}';

      expect(adapter.detect(source)).to.be.false;
    });
  });

  it('parses a valid OAS3 document', (done) => {
    const fury = new Fury();
    fury.use(adapter);

    const source = 'openapi: "3.0.0"\ninfo: {title: My API, version: 1.0.0}\npaths: {}\n';

    fury.parse({ source }, (err, parseResult) => {
      expect(parseResult).to.be.instanceof(fury.minim.elements.ParseResult);
      expect(parseResult.length).to.equal(1);
      expect(parseResult.api.title.toValue()).to.equal('My API');
      done();
    });
  });
});
