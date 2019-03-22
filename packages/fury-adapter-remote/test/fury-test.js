const { expect } = require('chai');
const { Fury } = require('fury');
const FuryRemoteAdapter = require('../lib/adapter');

const blueprintSource = 'FORMAT: 1A\n\n# API\n\n';
const swaggerSource = '{ "swagger": "2.0", "info": { "version": "1.0.0", "title": "swg" } }';
const invalidSwaggerSource = '{ "swagger": "2.0", "info": { "version": 1, "title": "swg" } }';


describe('Adapter works with Fury interface (with default config)', () => {
  const fury = new Fury();

  before(() => {
    fury.use(new FuryRemoteAdapter()); // with predefined options
  });
  describe('#parse', () => {
    it('blueprint with mediaType', () => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
      });
    });

    it('blueprint with autodetect', () => {
      fury.parse({ source: blueprintSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
      });
    });

    it('valid swagger with mediaType', () => {
      fury.parse({ source: swaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('swg');
      });
    });

    it('valid swagger with autodetect', () => {
      fury.parse({ source: swaggerSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('swg');
      });
    });

    it('invalid swagger with mediaType', () => {
      fury.parse({ source: invalidSwaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(1);
        expect(result.annotations.length).to.be.equal(1);
        expect(result.annotations.get(0).content).to.be.equal('API version number must be a string (e.g. "1.0.0") not a number.');
      });
    });
  });

  describe('#validate', () => {
    it('blueprint with mediaType', () => {
      fury.validate({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
      });
    });

    it('blueprint with autodetect', () => {
      fury.validate({ source: blueprintSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
      });
    });

    it('valid swagger with mediaType', () => {
      fury.validate({ source: swaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
      });
    });

    it('valid swagger with autodetect', () => {
      fury.validate({ source: swaggerSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(0);
        expect(result.annotations.length).to.be.equal(0);
      });
    });

    it('invalid swagger with mediaType', () => {
      fury.parse({ source: invalidSwaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.length).to.be.equal(1);
        expect(result.annotations.length).to.be.equal(1);
        expect(result.annotations.get(0).content).to.be.equal('API version number must be a string (e.g. "1.0.0") not a number.');
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

    it('ApiElements to blueprint', () => {
      fury.serialize({ api: blueprintApi }, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.string;
        expect(result).to.be.equal(blueprintSource);
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

    it('ParseResult to blueprint', () => {
      fury.serialize({ api: parseResultApi }, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.be.string;
        expect(result).to.be.equal(blueprintSource);
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

    it('parses blueprint with mediaType', () => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
      });
    });

    it('parses blueprint by detection', () => {
      fury.parse({ source: blueprintSource }, (err, result) => {
        expect(result).to.be.instanceof(fury.minim.elements.ParseResult);
        expect(result.api.title.toValue()).to.equal('API');
      });
    });

    it('do not parse swagger because swagger is not in supported mediaTypes', () => {
      fury.parse({ source: swaggerSource, mediaType: 'application/swagger+json' }, (err, result) => {
        expect(result).to.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property('message', 'Document did not match any registered parsers!');
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

    it('parses blueprint with mediaType', () => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property('message', 'getaddrinfo ENOTFOUND some.stupid.non.existing.domain some.stupid.non.existing.domain:80');
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

    it('parses blueprint with mediaType', () => {
      fury.parse({ source: blueprintSource, mediaType: 'text/vnd.apiblueprint' }, (err, result) => {
        expect(result).to.be.undefined;
        expect(err).to.be.instanceof(Error);
        expect(err).to.have.property('message', 'Request failed with status code 415');
      });
    });
  });
});
