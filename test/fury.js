import {assert} from 'chai';
import fury, {
  Fury, legacyBlueprintParser, legacyMarkdownRenderer
} from '../src/fury';

const refractedApi = [
  'parseResult', {}, {}, [
    ['category', {'classes': ['api'], title: 'My API'}, {}, [
      ['copy', {}, {}, 'An API description.'],
      ['category', {'classes': ['resourceGroup'], title: 'My Group'}, {}, [
        ['copy', {}, {contentType: 'text/plain'}, 'This is a group of resources'],
        ['resource', {title: 'Frob'}, {
          href: '/frobs/{id}',
          hrefVariables: ['hrefVariables', {}, {}, [
            ['member', {}, {}, {
              'key': ['string', {}, {}, 'id'],
              'value': ['string', {}, {}, ''],
            }],
          ]],
        }, [
          ['copy', {}, {}, 'A frob does something.'],
          ['dataStructure', {}, {}, ['object', {}, {}, [
            ['member', {}, {'typeAttributes': ['required']}, {
              'key': ['string', {}, {}, 'id'],
              'value': ['string', {}, {}, null],
            }],
            ['member', {}, {}, {
              'key': ['string', {}, {}, 'tag'],
              'value': ['string', {}, {}, null],
            }],
          ]]],
          ['transition', {}, {}, [
            ['copy', {}, {}, 'Gets information about a single frob instance'],
            ['httpTransaction', {title: 'Get a frob'}, {}, [
              ['httpRequest', {}, {method: 'GET'}, []],
              ['httpResponse', {}, {statusCode: 200, headers: ['httpHeaders', {}, {}, [
                ['member', {}, {}, {
                  key: ['string', {}, {}, 'Content-Type'],
                  value: ['string', {}, {}, 'application/json'],
                }],
              ]]}, [
                ['asset', {'classes': ['messageBody']}, {}, '{\n  "id": "1",\n  "tag": "foo"\n}\n'],
              ]],
            ]],
          ]],
        ]],
      ]],
    ]],
    ['annotation', {'classes': ['warning']}, {'code': 6, 'sourceMap': [[0, 10]]}, 'description'],
  ]];

describe('Nodes.js require', () => {
  it('should work without needing to use `.default`', () => {
    assert(require('../src/fury').parse);
  });
});

describe('Fury class', () => {
  it('should be able to create many instances', () => {
    const fury1 = new Fury();
    const fury2 = new Fury();

    assert(fury1);
    assert(fury2);
  });

  it('has unique adapters', () => {
    const fury1 = new Fury();
    const fury2 = new Fury();

    fury2.adapters.push('foo');

    assert.notDeepEqual(fury1.adapters, fury2.adapters);
  });
});

describe('Parser', () => {
  describe('custom adapters', () => {
    before(() => {
      const adapter = {
        name: 'passthrough',
        mediaTypes: ['text/vnd.passthrough'],
        detect: () => true,
        parse: ({source}, done) => done(null, ['string', {}, {}, source]),
        serialize: ({api}, done) => done(null, api),
      };

      fury.use(adapter);
    });

    after(() => {
      fury.adapters.pop();
    });

    it('should parse through mediatype', (done) => {
      fury.parse({source: 'dummy', mediaType: 'text/vnd.passthrough'}, (err, result) => {
        assert.equal(result.content, 'dummy');
        done(err);
      });
    });

    it('should parse through autodetect', (done) => {
      fury.parse({source: 'dummy'}, (err, result) => {
        assert.equal(result.content, 'dummy');
        done(err);
      });
    });

    it('should parse when returning element instances', (done) => {
      // Modify the parse method to return an element instance
      fury.adapters[fury.adapters.length - 1].parse = ({minim, source}, cb) => {
        const StringElement = minim.getElementClass('string');
        cb(null, new StringElement(source));
      };

      fury.parse({source: 'dummy'}, (err, result) => {
        assert.equal(result.content, 'dummy');
        done(err);
      });
    });

    it('should serialize through mediatype', (done) => {
      fury.serialize({api: 'dummy', mediaType: 'text/vnd.passthrough'}, (err, serialized) => {
        assert.equal(serialized, 'dummy');
        done(err);
      });
    });

    it('should error on parser exception', (done) => {
      const expected = new Error();
      fury.adapters[fury.adapters.length - 1].parse = () => {
        throw expected;
      };

      fury.parse({source: 'dummy'}, (err) => {
        assert.equal(err, expected);
        done();
      });
    });

    it('should error on parser error', (done) => {
      const expected = new Error();
      fury.adapters[fury.adapters.length - 1].parse = (options, done2) => {
        done2(expected);
      };

      fury.parse({source: 'dummy'}, (err) => {
        assert.equal(err, expected);
        done();
      });
    });

    it('should error on missing parser', (done) => {
      fury.adapters[fury.adapters.length - 1].parse = undefined;
      fury.parse({source: 'dummy'}, (err) => {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('should error on serializer exception', (done) => {
      const expected = new Error();
      fury.adapters[fury.adapters.length - 1].serialize = () => {
        throw expected;
      };

      fury.serialize({api: 'dummy', mediaType: 'text/vnd.passthrough'}, (err) => {
        assert.equal(err, expected);
        done();
      });
    });

    it('should error on serializer error', (done) => {
      const expected = new Error();
      fury.adapters[fury.adapters.length - 1].serialize = (options, done2) => {
        done2(expected);
      };

      fury.serialize({api: 'dummy', mediaType: 'text/vnd.passthrough'}, (err) => {
        assert.equal(err, expected);
        done();
      });
    });

    it('should error on missing serializer', (done) => {
      fury.adapters[fury.adapters.length - 1].serialize = undefined;
      fury.serialize({api: 'dummy', mediaType: 'text/vnd.passthrough'}, (err) => {
        assert.instanceOf(err, Error);
        done();
      });
    });
  });
});

describe('Refract loader', () => {
  describe('autodetect', () => {
    it('should support shorthand', () => {
      const api = fury.load(['category', {'classes': 'api'}, {}, []]);
      assert(api);
    });

    it('should support long-form', () => {
      const api = fury.load({
        element: 'category',
        meta: {
          'classes': 'api',
        },
        content: [],
      });
      assert(api);
    });
  });

  describe('shorthand', () => {
    let api;
    let annotation;

    before(() => {
      const result = fury.load(refractedApi);
      api = result.first();
      annotation = result.get(1);
    });

    context('parse result annotation', () => {
      it('should exist', () => {
        assert.ok(annotation);
      });

      it('should have a code', () => {
        assert.equal(annotation.code, 6);
      });

      it('should have text content', () => {
        assert.equal(annotation.toValue(), 'description');
      });

      it('should have a source map', () => {
        assert.deepEqual(annotation.attributes.get('sourceMap').toValue(), [[0, 10]]);
      });
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
      assert.equal(api.resourceGroups.get(0).copy.get(0).content,
                   'This is a group of resources');
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
      assert.equal(response.headers.get(0).value.toValue(), 'application/json');

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

      legacyBlueprintParser.parse({code: blueprintSource}, (error, api, warnings) => {
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

      legacyBlueprintParser.parse({code: blueprintSource}, (error, api, warnings) => {
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

      legacyMarkdownRenderer.toHtml(source, {}, (error, html) => {
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
