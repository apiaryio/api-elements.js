/* eslint-disable global-require */
import { assert } from 'chai';
import fury, { Fury } from '../src/fury';

const refractedApi = {
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
          content: 'My API',
        },
      },
      content: [
        {
          element: 'copy',
          content: 'An API description.',
        },
        {
          element: 'category',
          meta: {
            classes: {
              element: 'array',
              content: [
                {
                  element: 'string',
                  content: 'resourceGroup',
                },
              ],
            },
            title: {
              element: 'string',
              content: 'My Group',
            },
          },
          content: [
            {
              element: 'copy',
              attributes: {
                contentType: {
                  element: 'string',
                  content: 'text/plain',
                },
              },
              content: 'This is a group of resources',
            },
            {
              element: 'resource',
              meta: {
                title: {
                  element: 'string',
                  content: 'Frob',
                },
              },
              attributes: {
                href: {
                  element: 'string',
                  content: '/frobs/{id}',
                },
                hrefVariables: {
                  element: 'hrefVariables',
                  content: [
                    {
                      element: 'member',
                      content: {
                        key: {
                          element: 'string',
                          content: 'id',
                        },
                        value: {
                          element: 'string',
                          content: '',
                        },
                      },
                    },
                  ],
                },
              },
              content: [
                {
                  element: 'copy',
                  content: 'A frob does something.',
                },
                {
                  element: 'dataStructure',
                  content: {
                    element: 'object',
                    content: [
                      {
                        element: 'member',
                        attributes: {
                          typeAttributes: {
                            element: 'array',
                            content: [
                              {
                                element: 'string',
                                content: 'required',
                              },
                            ],
                          },
                        },
                        content: {
                          key: {
                            element: 'string',
                            content: 'id',
                          },
                          value: {
                            element: 'string',
                            content: null,
                          },
                        },
                      },
                      {
                        element: 'member',
                        content: {
                          key: {
                            element: 'string',
                            content: 'tag',
                          },
                          value: {
                            element: 'string',
                            content: null,
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  element: 'transition',
                  content: [
                    {
                      element: 'copy',
                      content: 'Gets information about a single frob instance',
                    },
                    {
                      element: 'httpTransaction',
                      meta: {
                        title: {
                          element: 'string',
                          content: 'Get a frob',
                        },
                      },
                      content: [
                        {
                          element: 'httpRequest',
                          attributes: {
                            method: {
                              element: 'string',
                              content: 'GET',
                            },
                          },
                          content: [],
                        },
                        {
                          element: 'httpResponse',
                          attributes: {
                            statusCode: {
                              element: 'number',
                              content: 200,
                            },
                            headers: {
                              element: 'httpHeaders',
                              content: [
                                {
                                  element: 'member',
                                  content: {
                                    key: {
                                      element: 'string',
                                      content: 'Content-Type',
                                    },
                                    value: {
                                      element: 'string',
                                      content: 'application/json',
                                    },
                                  },
                                },
                              ],
                            },
                          },
                          content: [
                            {
                              element: 'asset',
                              meta: {
                                classes: {
                                  element: 'array',
                                  content: [
                                    {
                                      element: 'string',
                                      content: 'messageBody',
                                    },
                                  ],
                                },
                              },
                              content: '{\n  "id": "1",\n  "tag": "foo"\n}\n',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      element: 'annotation',
      meta: {
        classes: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'warning',
            },
          ],
        },
      },
      attributes: {
        code: {
          element: 'number',
          content: 6,
        },
        sourceMap: {
          element: 'array',
          content: [
            {
              element: 'sourceMap',
              content: [
                {
                  element: 'array',
                  content: [
                    {
                      element: 'number',
                      content: 0,
                    },
                    {
                      element: 'number',
                      content: 10,
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      content: 'description',
    },
  ],
};

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

  describe('detecting type', () => {
    let localFury;
    let adapter;

    before(() => {
      adapter = {
        name: 'test',
        mediaTypes: ['text/vnd.test', 'text/vnd.testing'],
        detect: source => source === 'test',
      };

      localFury = new Fury();
      localFury.use(adapter);
    });

    it('can detect adapters from the source', () => {
      assert.deepEqual(localFury.detect('test'), [adapter]);
    });

    it('returns empty array when the type cannot be detected', () => {
      assert.equal(localFury.detect('none').length, 0);
    });
  });
});

describe('Parser', () => {
  describe('custom adapters', () => {
    before(() => {
      const adapter = {
        name: 'passthrough',
        mediaTypes: ['text/vnd.passthrough'],
        detect: () => true,
        parse: ({ source }, done) => done(null, { element: 'string', content: source }),
        serialize: ({ api }, done) => done(null, api),
      };

      fury.use(adapter);
    });

    after(() => {
      fury.adapters.pop();
    });

    it('should parse through mediatype', (done) => {
      fury.parse({ source: 'dummy', mediaType: 'text/vnd.passthrough' }, (err, result) => {
        assert.equal(result.content, 'dummy');
        done(err);
      });
    });

    it('should parse through autodetect', (done) => {
      fury.parse({ source: 'dummy' }, (err, result) => {
        assert.equal(result.content, 'dummy');
        done(err);
      });
    });

    it('should parse when returning element instances', (done) => {
      // Modify the parse method to return an element instance
      fury.adapters[fury.adapters.length - 1].parse = ({ minim, source }, cb) => {
        const StringElement = minim.getElementClass('string');
        cb(null, new StringElement(source));
      };

      fury.parse({ source: 'dummy' }, (err, result) => {
        assert.equal(result.content, 'dummy');
        done(err);
      });
    });

    it('should pass adapter options during parsing', (done) => {
      const { length } = fury.adapters;

      fury.adapters[length - 1].parse = ({ minim, testOption = false }, cb) => {
        const BooleanElement = minim.getElementClass('boolean');
        return cb(null, new BooleanElement(testOption));
      };

      fury.parse({ source: 'dummy', adapterOptions: { testOption: true } }, (err, result) => {
        assert.isNull(err);
        assert.isTrue(result.content);
        done();
      });
    });

    it('should serialize through mediatype', (done) => {
      fury.serialize({ api: 'dummy', mediaType: 'text/vnd.passthrough' }, (err, serialized) => {
        assert.equal(serialized, 'dummy');
        done(err);
      });
    });

    it('should error on parser exception', (done) => {
      const expected = new Error();
      fury.adapters[fury.adapters.length - 1].parse = () => {
        throw expected;
      };

      fury.parse({ source: 'dummy' }, (err) => {
        assert.equal(err, expected);
        done();
      });
    });

    it('should error on parser error', (done) => {
      const expectedError = new Error();
      const expectedElements = { element: 'string', content: 'Hello' };
      fury.adapters[fury.adapters.length - 1].parse = (options, done2) => {
        done2(expectedError, expectedElements);
      };

      fury.parse({ source: 'dummy' }, (err, elements) => {
        assert.equal(err, expectedError);
        assert.deepEqual(elements, fury.load(expectedElements));
        done();
      });
    });

    it('should error on missing parser', (done) => {
      fury.adapters[fury.adapters.length - 1].parse = undefined;
      fury.parse({ source: 'dummy' }, (err) => {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('should error on serializer exception', (done) => {
      const expected = new Error();
      fury.adapters[fury.adapters.length - 1].serialize = () => {
        throw expected;
      };

      fury.serialize({ api: 'dummy', mediaType: 'text/vnd.passthrough' }, (err) => {
        assert.equal(err, expected);
        done();
      });
    });

    it('should error on serializer error', (done) => {
      const expected = new Error();
      fury.adapters[fury.adapters.length - 1].serialize = (options, done2) => {
        done2(expected);
      };

      fury.serialize({ api: 'dummy', mediaType: 'text/vnd.passthrough' }, (err) => {
        assert.equal(err, expected);
        done();
      });
    });

    it('should error on missing serializer', (done) => {
      fury.adapters[fury.adapters.length - 1].serialize = undefined;
      fury.serialize({ api: 'dummy', mediaType: 'text/vnd.passthrough' }, (err) => {
        assert.instanceOf(err, Error);
        done();
      });
    });
  });
});

describe('Refract loader', () => {
  describe('autodetect', () => {
    it('should support long-form', () => {
      const api = fury.load({
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
        },
        content: [],
      });
      assert(api);
    });
  });

  describe('when given a valid api', () => {
    let api;
    let annotation;

    before(() => {
      const parseResult = fury.load(refractedApi);
      ({ api } = parseResult);

      annotation = parseResult.annotations.first;
    });

    it('should contain parse result annotation', () => {
      assert.ok(annotation);
    });

    it('should contain annotation code', () => {
      assert.equal(annotation.code.toValue(), 6);
    });

    it('should contain annotation description', () => {
      assert.equal(annotation.toValue(), 'description');
    });

    it('should contain annotation source map', () => {
      assert.deepEqual(annotation.attributes.get('sourceMap').first.toValue(), [[0, 10]]);
    });

    it('should parse a refract API', () => {
      assert.ok(api);
    });

    it('should contain a title', () => {
      assert.equal(api.title.toValue(), 'My API');
    });

    it('should contain a single resource group', () => {
      assert.equal(api.resourceGroups.length, 1);
      assert.equal(api.resourceGroups.get(0).title.toValue(), 'My Group');
    });

    it('should contain a single copy element', () => {
      assert.equal(api.resourceGroups.get(0).copy.length, 1);
      assert.equal(api.resourceGroups.get(0).copy.get(0).content, 'This is a group of resources');
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
      const resource = api.resourceGroups.get(0).resources.get(0);
      assert.equal(resource.transitions.get(0).transactions.length, 1);
    });

    it('should contain a request', () => {
      const resource = api.resourceGroups.get(0).resources.get(0);
      const { request } = resource.transitions.get(0).transactions.get(0);

      assert(request);
    });

    it('should contain a response', () => {
      const resource = api.resourceGroups.get(0).resources.get(0);
      const { response } = resource.transitions.get(0).transactions.get(0);

      assert(response);
      assert.equal(response.statusCode.toValue(), 200);
    });

    it('should set content-type header in the response', () => {
      const resource = api.resourceGroups.get(0).resources.get(0);
      const { response } = resource.transitions.get(0).transactions.get(0);

      // Get the header element by index and read the value
      assert.equal(response.headers.get(0).value.toValue(), 'application/json');

      // Convenience to get a header by name
      assert.equal(response.header('content-type')[0].toValue(), 'application/json');
    });
  });
});
