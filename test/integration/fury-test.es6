var assert = require('chai').assert;
var fury = require('../../lib/fury');
var legacyParser = require('../../lib/fury').legacyBlueprintParser;
var legacyRenderer = require('../../lib/fury').legacyMarkdownRenderer;

describe('Parser', () => {
  it('should recognize API Blueprint', (done) => {
    const source = 'FORMAT: 1A\n\n# My API\n';
    fury.parse({source}, (err, api) => {
      assert(api);
      done(err);
    });
  });

  it('should error on unknown input', (done) => {
    const source = 'unknown';
    fury.parse({source}, (err) => {
      assert(err);
      done();
    });
  });

  describe('custom adapters', () => {
    before(() => {
      const adapter = {
        name: 'passthrough',
        mediaTypes: ['text/vnd.passthrough'],
        detect: () => true,
        parse: ({source}, done) => done(null, ['string', {}, {}, source]),
        serialize: ({api}, done) => done(null, api)
      };

      fury.adapters.push(adapter);
    });

    after(() => {
      fury.adapters.pop();
    });

    it('should parse through mediatype', (done) => {
      fury.parse({source: 'dummy', mediaType: 'text/vnd.passthrough'}, (err, api) => {
        assert.equal(api.content, 'dummy');
        done(err);
      });
    });

    it('should parse through autodetect', (done) => {
      fury.parse({source: 'dummy'}, (err, api) => {
        assert.equal(api.content, 'dummy');
        done(err);
      });
    });

    it('should serialize through mediatype', (done) => {
      fury.serialize({api: 'dummy', mediaType: 'text/vnd.passthrough'}, (err, serialized) => {
        assert.equal(serialized, 'dummy');
        done(err);
      });
    });
  });
});

describe('Refract loader', () => {
  describe('autodetect', () => {
    it('should support shorthand', () => {
      let api = fury.load(['category', {'class': 'api'}, {}, []]);
      assert(api);
    });

    it('should support long-form', () => {
      let api = fury.load({
        element: 'category',
        meta: {
          'class': 'api'
        },
        content: []
      });
      assert(api);
    });
  });

  describe('shorthand', () => {
    let api;

    before(() => {
      api = fury.load([
        'category', {'class': ['api'], 'title': 'My API'}, {}, [
          ['category', {'class': ['resourceGroup'], title: 'My Group'}, {}, [
            ['copy', {}, {contentType: 'text/plain'}, 'Extra text'],
            ['resource', {title: 'Frob'}, {
              href: '/frobs/{id}',
              hrefVariables: ['hrefVariables', {}, {}, [
                  ['string', {name: 'id'}, {}, '']
                ]]
              }, [
              ['dataStructure', {}, {}, [
                ['string', {name: 'id'}, {}, null],
                ['string', {name: 'tag'}, {}, null]
              ]],
              ['transition', {}, {}, [
                ['httpTransaction', {}, {}, [
                  ['httpRequest', {}, {}, null],
                  ['httpResponse', {}, {statusCode: 200, headers: ['httpHeaders', {}, {}, [
                    ['string', {name: 'Content-Type'}, {}, 'application/json']
                  ]]}, [
                    ['asset', {'class': 'messageBody'}, {}, '{"id": "1", "tag": "foo"}']
                  ]]
                ]]
              ]]
            ]]
          ]]
        ]
      ]);
    });

    it('should parse a refract shorthand API', () => {
      assert.ok(api);
    });

    it('should contain a title', () => {
      assert.equal(api.title, 'My API');
    });

    it('should contain a single resource group', () => {
      assert.equal(api.resourceGroups.length, 1);
      assert.equal(api.resourceGroups.get(0).title, 'My Group');
    });

    it('should contain a single copy element', () => {
      assert.equal(api.resourceGroups.get(0).copy.length, 1);
      assert.equal(api.resourceGroups.get(0).copy.get(0).content, 'Extra text');
    });

    it('should contain a single resource', () => {
      assert.equal(api.resourceGroups.get(0).resources.length, 1);
    });

    it('should have an `id` href variable', () => {
      const resource = api.resourceGroups.get(0).resources.get(0);
      assert.equal(resource.hrefVariables.length, 1);
      assert.equal(resource.hrefVariables.keys()[0], 'id');
    });

    it('should contain a single transition', () => {
      assert.equal(api.resourceGroups.get(0).resources.get(0).transitions.length, 1);
    });

    it('should contain a single transaction', () => {
      assert.equal(api.resourceGroups.get(0).resources.get(0).transitions.get(0)
                   .transactions.length, 1);
    });

    it('Should contain a request', () => {
      const resource = api.resourceGroups.get(0).resources.get(0);
      const request = resource.transitions.get(0).transactions.get(0).request;

      assert(request);
    });

    it('Should contain a response', () => {
      const resource = api.resourceGroups.get(0).resources.get(0);
      const response = resource.transitions.get(0).transactions.get(0).response;

      assert(response);
      assert.equal(response.statusCode, 200);
    });

    it('should set content-type header in the response', () => {
      const resource = api.resourceGroups.get(0).resources.get(0);
      const response = resource.transitions.get(0).transactions.get(0).response;

      // Get the header element by index and read the value
      assert.equal(response.headers.get(0).content, 'application/json');

      // Convenience to get a header by name
      assert.equal(response.header('content-type'), 'application/json');
    });
  });
});

describe('Using legacy parser', () => {
  let parserError = null;
  let parsedAPI = null;
  let parserWarnings = null;

  describe('to parse API Blueprint', () => {
    before(function(done) {
      const blueprintSource = 'FORMAT: 1A\n' +
                              '\n' +
                              '# My API\n';

      legacyParser.parse({code: blueprintSource}, (error, api, warnings) => {
        parserError = error;
        parsedAPI = api;
        parserWarnings = warnings;
        done();
      });
    });

    it('should succeed', () => {
      assert.isNull(parserError);
    });

    it('API should be defined', () => {
      assert.isDefined(parsedAPI);
    });

    it('API name should be "My API"', () => {
      assert.equal(parsedAPI.name, 'My API');
    });
  });

  describe('to parse Apiary Blueprint', () => {
    before((done) => {
      const blueprintSource = '\n--- Sample API v2 ---\n';

      legacyParser.parse({code: blueprintSource}, (error, api, warnings) => {
        parserError = error;
        parsedAPI = api;
        parserWarnings = warnings;
        done();
      });
    });

    it('should succeed', () => {
      assert.isNull(parserError);
    });

    it('API should be defined', () => {
      assert.isDefined(parsedAPI);
    });

    it('API name should be "Sample API v2"', () => {
      assert.equal(parsedAPI.name, 'Sample API v2');
    });
  });
});

describe('Using legacy Markdown renderer', () => {
  describe('to render Markdown', () => {
    let renderError = null;
    let renderResult = null;

    before((done) => {
      const source = '# My API\n';

      legacyRenderer.toHtml(source, {}, (error, html) => {
        renderError = error;
        renderResult = html;
        done();
      });
    });

    it('should succeed', () => {
      assert.isNull(renderError);
    });

    it('result should be defined', () => {
      assert.isDefined(renderResult);
    });

    it('result should be rendered correctly', () => {
      assert.equal(renderResult, '<h1>My API</h1>\n');
    });
  });
});
