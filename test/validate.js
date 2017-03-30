/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { validate } from '../src/adapter';

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
      expect(parseResult).to.deep.equal({
        element: 'parseResult',
        content: [
          {
            element: 'annotation',
            meta: {
              classes: [
                'warning',
              ],
            },
            attributes: {
              code: 6,
              sourceMap: [
                {
                  element: 'sourceMap',
                  content: [
                    [
                      0,
                      8,
                    ],
                  ],
                },
              ],
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
      expect(parseResult).to.deep.equal({
        element: 'parseResult',
        content: [
          {
            element: 'annotation',
            meta: {
              classes: [
                'error',
              ],
            },
            attributes: {
              code: 4,
              sourceMap: [
                {
                  element: 'sourceMap',
                  content: [
                    [
                      18,
                      8,
                    ],
                  ],
                },
              ],
            },
            content: "base type 'A' circularly referencing itself",
          },
        ],
      });

      done();
    });
  });
});
