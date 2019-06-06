const { expect } = require('chai');
const { Fury } = require('../lib/fury');
const assert = require('./assert');

describe('Validation', () => {
  let fury;
  let shouldDetect;
  let result;

  beforeEach(() => {
    fury = new Fury();

    fury.use({
      name: 'passthrough',
      mediaTypes: ['text/vnd.passthrough'],
      detect: () => shouldDetect,
      validate: () => Promise.resolve(result),
    });

    shouldDetect = false;
    result = null;
  });

  context('with a validate adapter', () => {
    it('should validate through mediatype', (done) => {
      fury.validate({ source: 'dummy', mediaType: 'text/vnd.passthrough' }, (err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.null;
        done();
      });
    });

    it('should validate through autodetect', (done) => {
      shouldDetect = true;

      fury.validate({ source: 'dummy' }, (err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.null;
        done();
      });
    });

    it('should error when validating with no matching validator', (done) => {
      fury.validate({ source: 'dummy' }, (err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.be.undefined;
        done();
      });
    });

    it('should convert an object parse result into minim elements', (done) => {
      shouldDetect = true;
      result = {
        element: 'parseResult',
        content: [
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
            content: 'a wild warning appeared',
          },
        ],
      };

      fury.validate({ source: 'dummy' }, (err, res) => {
        expect(err).to.be.null;
        expect(fury.minim.toRefract(res)).to.deep.equal({
          element: 'parseResult',
          content: [
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
              content: 'a wild warning appeared',
            },
          ],
        });
        done();
      });
    });

    it('should pass adapter options during validation', (done) => {
      shouldDetect = true;
      fury.adapters[0].validate = ({ namespace, testOption = false }) => {
        const BooleanElement = namespace.getElementClass('boolean');
        return Promise.resolve(new BooleanElement(testOption));
      };

      fury.validate({ source: 'dummy', adapterOptions: { testOption: true } }, (err, res) => {
        expect(err).to.be.null;
        expect(res.content).to.be.true;
        done();
      });
    });
  });

  context('with a parse adapter without validate', () => {
    let result = null;
    const fury = new Fury();

    fury.use({
      name: 'passthrough',
      mediaTypes: ['text/vnd.passthrough'],
      detect: () => true,
      parse: () => Promise.resolve(result),
    });

    before(() => {
      result = null;
    });

    it('should validate when there are no annotations', (done) => {
      result = {
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
            },
            content: [],
          },
        ],
      };

      fury.validate({ source: 'dummy', mediaType: 'text/vnd.passthrough' }, (err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.null;
        done();
      });
    });

    it('should validate when there are annotations', (done) => {
      result = {
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
            },
            content: [],
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
            content: 'a wild warning appeared',
          },
        ],
      };

      fury.validate({ source: 'dummy', mediaType: 'text/vnd.passthrough' }, (err, res) => {
        expect(err).to.be.null;
        expect(fury.minim.toRefract(res)).to.deep.equal({
          element: 'parseResult',
          content: [
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
              content: 'a wild warning appeared',
            },
          ],
        });

        done();
      });
    });
  });

  describe('using async/await', () => {
    beforeEach(() => {
      shouldDetect = true;
      result = {
        element: 'parseResult',
        content: [
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
            content: 'a wild warning appeared',
          },
        ],
      };
    });

    it('errors with matching erroring adapter', async () => {
      const expectedError = new Error('failed to parse');
      fury.adapters[fury.adapters.length - 1].parse = () => Promise.reject(expectedError);

      await assert.rejects(
        async () => {
          await fury.parse({ source: '' });
        },
        'failed to parse'
      );
    });

    it('can validate with matching validate adapter', async () => {
      const parseResult = await fury.validate({ source: 'doc' });

      expect(parseResult).to.be.instanceof(fury.minim.elements.ParseResult);
      expect(parseResult.toValue()).to.deep.equal([
        'a wild warning appeared',
      ]);
    });

    it('can validate with matching parse adapter', async () => {
      fury = new Fury();
      fury.use({
        name: 'passthrough',
        mediaTypes: ['text/vnd.passthrough'],
        detect: () => true,
        parse: () => Promise.resolve(result),
      });

      const parseResult = await fury.validate({ source: 'doc' });

      expect(parseResult).to.be.instanceof(fury.minim.elements.ParseResult);
      expect(parseResult.toValue()).to.deep.equal([
        'a wild warning appeared',
      ]);
    });
  });
});
