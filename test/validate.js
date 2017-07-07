/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { Namespace } from 'minim';
import { validate } from '../src/adapter';

const minim = new Namespace();

describe('API Blueprint validation', () => {
  it('can validate an API Blueprint', (done) => {
    const source = '# API Name\n';

    validate({ source }, (err, parseResult) => {
      expect(err).to.be.null;
      expect(parseResult).to.be.null;

      done();
    });
  });

  it('can validate an API Blueprint with a warning', (done) => {
    const source = '# GET /\n';

    validate({ source }, (err, parseResult) => {
      expect(err).to.be.null;
      expect(minim.toRefract(parseResult)).to.deep.equal({
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
                            content: 8,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            content: 'action is missing a response',
          },
        ],
      });

      done();
    });
  });

  it('can validate an API Blueprint with an error', (done) => {
    const source = '# Data Structures\n# A (A)\n';

    validate({ source }, (err, parseResult) => {
      expect(err).to.be.null;
      expect(minim.toRefract(parseResult)).to.deep.equal({
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
                    content: 'error',
                  },
                ],
              },
            },
            attributes: {
              code: {
                element: 'number',
                content: 4,
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
                            content: 18,
                          },
                          {
                            element: 'number',
                            content: 8,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            content: "base type 'A' circularly referencing itself",
          },
        ],
      });

      done();
    });
  });
});
