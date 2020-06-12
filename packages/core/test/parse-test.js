const { assert } = require('chai');
const { Fury } = require('../lib/fury');
const { rejects } = require('./assert');

describe('Parser', () => {
  let fury;

  beforeEach(() => {
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

  describe('using callback', () => {
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
      fury.adapters[fury.adapters.length - 1].parse = ({ namespace, source }) => {
        const { ParseResult } = namespace.elements;
        return Promise.resolve(new ParseResult(source));
      };

      fury.parse({ source: 'dummy' }, (err, result) => {
        assert.equal(result.toValue(), 'dummy');
        done(err);
      });
    });

    it('should pass adapter options during parsing', (done) => {
      const { length } = fury.adapters;

      fury.adapters[length - 1].parse = ({ namespace, testOption = false }) => {
        const BooleanElement = namespace.getElementClass('boolean');
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

  describe('using async/await', () => {
    it('errors with unknown mediaType', async () => {
      const fury = new Fury();
      const source = '';

      await rejects(
        async () => {
          await fury.parse({ source, mediaType: 'application/unregistered' });
        },
        'Document did not match any registered parsers!'
      );
    });

    it('errors with matching erroring adapter', async () => {
      const expectedError = new Error('failed to parse');
      fury.adapters[fury.adapters.length - 1].parse = () => Promise.reject(expectedError);

      await rejects(
        async () => {
          await fury.parse({ source: '' });
        },
        'failed to parse'
      );
    });

    it('can parse with matching adapter', async () => {
      const result = await fury.parse({ source: 'doc' });

      assert.instanceOf(result, fury.minim.elements.String);
      assert.equal(result.toValue(), 'doc');
    });
  });
});
