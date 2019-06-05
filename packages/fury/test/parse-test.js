const { assert } = require('chai');
const { Fury } = require('../lib/fury');

describe('Parser', () => {
  let fury;

  before(() => {
    fury = new Fury();
    const adapter = {
      name: 'passthrough',
      mediaTypes: ['text/vnd.passthrough'],
      detect: () => true,
      parse: ({ source }) => Promise.resolve({ element: 'string', content: source }),
      serialize: ({ api }) => Promise.resolve(api),
    };

    fury.use(adapter);
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
    fury.adapters[fury.adapters.length - 1].parse = ({ minim, source }) => {
      const { ParseResult } = minim.elements;
      return Promise.resolve(new ParseResult(source));
    };

    fury.parse({ source: 'dummy' }, (err, result) => {
      assert.equal(result.toValue(), 'dummy');
      done(err);
    });
  });

  it('should pass adapter options during parsing', (done) => {
    const { length } = fury.adapters;

    fury.adapters[length - 1].parse = ({ minim, testOption = false }) => {
      const BooleanElement = minim.getElementClass('boolean');
      return Promise.resolve(new BooleanElement(testOption));
    };

    fury.parse({ source: 'dummy', adapterOptions: { testOption: true } }, (err, result) => {
      assert.isNull(err);
      assert.isTrue(result.content);
      done();
    });
  });

  it('should error on parser error', (done) => {
    const expectedError = new Error();
    fury.adapters[fury.adapters.length - 1].parse = () => Promise.reject(expectedError);

    fury.parse({ source: 'dummy' }, (err, parseResult) => {
      assert.equal(err, expectedError);
      assert.isUndefined(parseResult);
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
});
