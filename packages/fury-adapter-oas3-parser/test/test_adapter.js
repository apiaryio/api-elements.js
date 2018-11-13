const { expect } = require('chai');
const { Fury } = require('fury');

const adapter = require('../lib/adapter');

describe('Adapter', function () {
  it('has a name', function () {
    expect(adapter.name).to.equal('oas3');
  });

  it('has OpenAPI media types', function () {
    expect(adapter.mediaTypes).to.deep.equal([
      'application/vnd.oai.openapi',
      'application/vnd.oai.openapi+json',
    ]);
  });

  describe('detection', function () {
    it('can detect OpenAPI 3.0.0 YAML document', function () {
      const source = 'openapi: "3.0.0"';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.0 JSON document', function () {
      const source = '{"openapi": "3.0.0"}';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.1 YAML document', function () {
      const source = 'openapi: "3.0.1"';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.1 JSON document', function () {
      const source = '{"openapi": "3.0.1"}';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.1.0 YAML document', function () {
      const source = 'openapi: "3.1.0"';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.1 JSON document', function () {
      const source = '{"openapi": "3.1.0"}';

      expect(adapter.detect(source)).to.be.true;
    });

    it('can detect OpenAPI 3.0.1 YAML document', function () {
      const source = 'swagger: "2.0"';

      expect(adapter.detect(source)).to.be.false;
    });

    it('does not detect Swagger 2 JSON document', function () {
      const source = '{"swagger": "2.0"}';

      expect(adapter.detect(source)).to.be.false;
    });
  });

  it('parses a valid OAS3 document', function (done) {
    const minim = new Fury().minim;
    const source = 'openapi: "3.0.0"\ninfo: {title: My API, version: 1.0.0}\npaths: {}\n';

    adapter.parse({ source, minim }, (err, parseResult) => {
      expect(parseResult).to.be.instanceof(minim.elements.ParseResult);
      expect(parseResult.length).to.equal(1);
      expect(parseResult.api.title.toValue()).to.equal('My API');
      done();
    });
  });
});
