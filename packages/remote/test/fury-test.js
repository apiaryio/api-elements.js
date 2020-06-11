const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const FuryRemoteAdapter = require('../lib/adapter');

const blueprintSource = 'FORMAT: 1A\n\n# API\n';
const swaggerSource = '{ "swagger": "2.0", "info": { "version": "1.0.0", "title": "swg" } }';
const invalidSwaggerSource = '{ "swagger": "2.0", "info": { "version": 1, "title": "swg" } }';

const apiblueprintWithResponse = `# My API
## POST /

+ Response 200 (application/json)

    + Attributes

        + message: Hello World
`;

function getFirstResponseElement(response) {
  const resource = response.api.resources.get(0);
  return resource.transitions.get(0).transactions.get(0).response;
}

describe('Adapter works with Fury interface (with default config)', function remoteAdapterTests() {
  this.timeout(4000);

  const fury = new Fury();

  before(() => {
    fury.use(new FuryRemoteAdapter()); // with predefined options
  });
  describe('#parse', () => {
    it('blueprint with mediaType', (done) => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
        done();
      });
    });

    it('blueprint with autodetect', (done) => {
      fury.parse({ source: blueprintSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
        done();
      });
    });

    it('blueprint with generateSourceMap set to true', (done) => {
      fury.parse({ source: blueprintSource, generateSourceMap: true }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.sourceMapValue).to.not.be.undefined;
        done();
      });
    });

    it('blueprint with generateSourceMap set to false', (done) => {
      fury.parse({ source: blueprintSource, generateSourceMap: false }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.sourceMapValue).to.be.undefined;
        done();
      });
    });

    it('blueprint without generateSourceMap', (done) => {
      fury.parse({ source: blueprintSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.sourceMapValue).to.be.undefined;
        done();
      });
    });

    it('valid swagger with mediaType', (done) => {
      fury.parse({ source: swaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('swg');
        done();
      });
    });

    it('valid swagger with autodetect', (done) => {
      fury.parse({ source: swaggerSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('swg');
        done();
      });
    });

    it('invalid swagger with mediaType', (done) => {
      fury.parse({ source: invalidSwaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(1);
        expect(result.annotations.length).to.be.equal(1);
        expect(result.annotations.get(0).content).to.be.equal('API version number must be a string (e.g. "1.0.0") not a number.');
        done();
      });
    });

    it('blueprint with generateMessageBody set to true', (done) => {
      fury.parse({
        source: apiblueprintWithResponse,
        mediaType: 'text/vnd.apiblueprint',
        adapterOptions: {
          generateMessageBody: true,
          generateMessageBodySchema: true,
        },
      }, (err, result) => {
        expect(getFirstResponseElement(result).messageBody).not.to.be.undefined;
        done();
      });
    });

    it('blueprint with generateMessageBody set to false', (done) => {
      fury.parse({
        source: apiblueprintWithResponse,
        mediaType: 'text/vnd.apiblueprint',
        adapterOptions: {
          generateMessageBody: false,
          generateMessageBodySchema: false,
        },
      }, (err, result) => {
        expect(getFirstResponseElement(result).messageBody).to.be.undefined;
        done();
      });
    });
  });

  describe('#validate', () => {
    it('blueprint with mediaType', (done) => {
      fury.validate({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
        done();
      });
    });

    it('blueprint with autodetect', (done) => {
      fury.validate({ source: blueprintSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
        done();
      });
    });

    it('valid swagger with mediaType', (done) => {
      fury.validate({ source: swaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
        done();
      });
    });

    it('valid swagger with autodetect', (done) => {
      fury.validate({ source: swaggerSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
        done();
      });
    });

    it('invalid swagger with mediaType', (done) => {
      fury.parse({ source: invalidSwaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(1);
        expect(result.annotations.length).to.be.equal(1);
        expect(result.annotations.get(0).content).to.be.equal('API version number must be a string (e.g. "1.0.0") not a number.');
        done();
      });
    });
  });

  describe('#serialize', () => {
    const blueprintApi = fury.minim.serialiser.deserialise({
      element: 'category',
      meta: {
        classes: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'api',
            },
          ],
        },
        title: {
          element: 'string',
          content: 'API',
        },
      },
      content: [],
    });

    it('ApiElements to blueprint', (done) => {
      fury.serialize({ api: blueprintApi }, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.string;
        expect(result).to.be.equal(blueprintSource);
        done();
      });
    });

    const parseResultApi = fury.minim.serialiser.deserialise({
      element: 'parseResult',
      content: [
        {
          element: 'category',
          meta: {
            classes: {
              element: 'array',
              content: [
                {
                  element: 'string',
                  content: 'api',
                },
              ],
            },
            title: {
              element: 'string',
              content: 'API',
            },
          },
          content: [],
        },
      ],
    });

    it('ParseResult to blueprint', (done) => {
      fury.serialize({ api: parseResultApi }, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.string;
        expect(result).to.be.equal(blueprintSource);
        done();
      });
    });
  });
});

describe('Adapter works with Fury interface', () => {
  describe('with own config', () => {
    const fury = new Fury();

    before(() => {
      fury.use(new FuryRemoteAdapter({
        url: 'https://api.apielements.org',
        parseEndpoint: '/parser',
        mediaTypes: [
          'text/vnd.apiblueprint',
        ],
      }));
    });

    it('parses blueprint with mediaType', (done) => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
        done();
      });
    });

    it('parses blueprint by detection', () => {
      fury.parse({ source: blueprintSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
      });
    });

    it('do not parse swagger because swagger is not in supported mediaTypes', (done) => {
      fury.parse({ source: swaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property('message', 'Document did not match any registered parsers!');
        done();
      });
    });
  });

  describe('#detect', () => {
    const fury = new Fury();
    const defaultAdapater = new FuryRemoteAdapter();
    const arrayMediaTypesAdapater = new FuryRemoteAdapter({
      mediaTypes: ['text/vnd.apiblueprint'],
    });
    const objectMediaTypesAdapater = new FuryRemoteAdapter({
      mediaTypes: {
        parse: ['text/vnd.apiblueprint'],
        validate: ['application/swagger+json'],
      },
    });

    before(() => {
      fury.use(defaultAdapater);
      fury.use(arrayMediaTypesAdapater);
      fury.use(objectMediaTypesAdapater);
    });

    it('works with different mediaTypes configurations', () => {
      expect(fury.detect(blueprintSource, 'parse')).to.be.deep.equal([defaultAdapater, arrayMediaTypesAdapater, objectMediaTypesAdapater]);
      expect(fury.detect(swaggerSource, 'parse')).to.be.deep.equal([defaultAdapater]);
      expect(fury.detect(blueprintSource, 'validate')).to.be.deep.equal([defaultAdapater, arrayMediaTypesAdapater]);
      expect(fury.detect(swaggerSource, 'validate')).to.be.deep.equal([defaultAdapater, objectMediaTypesAdapater]);
    });
  });

  describe('with nonexisting domain', () => {
    const fury = new Fury();

    before(() => {
      fury.use(new FuryRemoteAdapter({
        url: 'http://some.stupid.non.existing.domain',
        parseEndpoint: '/parser',
        mediaTypes: [
          'text/vnd.apiblueprint',
        ],
      }));
    });

    it('parses blueprint with mediaType', (done) => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.match(/ENOTFOUND some\.stupid\.non\.existing\.domain/);
        done();
      });
    });
  });

  describe('with invalid endpoint', () => {
    const fury = new Fury();

    before(() => {
      fury.use(new FuryRemoteAdapter({
        url: 'https://api.apielements.org',
        parseEndpoint: '/some.weird.endpoint',
        mediaTypes: [
          'text/vnd.apiblueprint',
        ],
      }));
    });

    it('parses blueprint with mediaType', (done) => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property('message', 'Request failed with status code 404');
        done();
      });
    });
  });
});
