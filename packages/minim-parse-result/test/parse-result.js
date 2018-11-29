/* eslint-disable no-unused-expressions */
/*
 * Tests for parse result namespace elements, including all their
 * convenience properties and methods.
 */

import chai, { Assertion, expect } from 'chai';

import minim from 'minim';
import minimParseResult from '../src/parse-result';

const namespace = minim.namespace()
  .use(minimParseResult);

const Annotation = namespace.getElementClass('annotation');
const Category = namespace.getElementClass('category');

chai.use((_chai, utils) => {
  /*
   * Asserts that an element has a certain class.
   */
  utils.addMethod(Assertion.prototype, 'class', function hasClass(name) {
    // eslint-disable-next-line no-underscore-dangle
    const obj = this._obj;

    this.assert(
      obj.classes.contains(name),
      'Expected class list #{act} to contain #{exp}',
      'Expected class list #{act} to not contain #{exp}',
      name,
      obj.classes.toValue(),
    );
  });
});

/*
 * Shortcut to get an attribute value from an element.
 */
function attrValue(element, name) {
  return element.attributes.getValue(name);
}

describe('Parse result namespace', () => {
  context('parse result element', () => {
    let parseResult;
    let refracted;

    beforeEach(() => {
      refracted = {
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
          },
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
          },
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
          },
        ],
      };

      parseResult = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(parseResult)).to.deep.equal(refracted);
    });

    it('should have element name parseResult', () => {
      expect(parseResult.element).to.equal('parseResult');
    });

    it('should contain an API', () => {
      const { api } = parseResult;
      expect(api).to.be.an.instanceof(Category);
      expect(api).to.have.class('api');
    });

    it('should contain two annotations', () => {
      const items = parseResult.annotations;
      expect(items).to.have.length(2);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Annotation);
      });
    });

    it('should contain a warning', () => {
      const items = parseResult.warnings;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Annotation);
        expect(item).to.have.class('warning');
      });
    });

    it('should contain an error', () => {
      const items = parseResult.errors;
      expect(items).to.have.length(1);
      items.forEach((item) => {
        expect(item).to.be.an.instanceof(Annotation);
        expect(item).to.have.class('error');
      });
    });
  });

  context('annotation element', () => {
    let annotation;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'annotation',
        attributes: {
          code: {
            element: 'number',
            content: 123,
          },
        },
        content: 'Missing argument description',
      };

      annotation = namespace.fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(annotation)).to.deep.equal(refracted);
    });

    it('should have element name annotation', () => {
      expect(annotation.element).to.equal('annotation');
    });

    it('should get a code', () => {
      expect(annotation.code.toValue()).to.equal(123);
    });

    it('should set a code', () => {
      annotation.code = 456;
      expect(attrValue(annotation, 'code')).to.equal(456);
    });

    it('should have text content', () => {
      expect(annotation.content).to.equal('Missing argument description');
    });
  });

  context('source map element', () => {
    let sourceMap;

    beforeEach(() => {
      sourceMap = namespace.fromRefract({
        element: 'sourceMap',
        content: [],
      });
    });

    it('should have element name sourceMap', () => {
      expect(sourceMap.element).to.equal('sourceMap');
    });
  });

  context('source maps', () => {
    let element;
    let sourceMaps;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'string',
        attributes: {
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
                        content: 1,
                      },
                      {
                        element: 'number',
                        content: 2,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        content: '',
      };

      element = namespace.fromRefract(refracted);
      sourceMaps = element.attributes.get('sourceMap');
    });

    it('should round-trip correctly', () => {
      expect(namespace.toRefract(element)).to.deep.equal(refracted);
    });

    it('should contain a sourceMap attribute with one item', () => {
      // eslint-disable-next-line no-unused-expressions
      expect(sourceMaps).to.exist;
      expect(sourceMaps).to.have.length(1);
    });

    it('should have the source map location', () => {
      expect(sourceMaps.first.toValue()).to.deep.equal([[1, 2]]);
    });

    it('should have a convenience method for retrieving source map', () => {
      expect(element.sourceMapValue).to.deep.equal([[1, 2]]);
    });
  });

  context('source map convenience function', () => {
    let element;
    let refracted;

    beforeEach(() => {
      refracted = {
        element: 'string',
        content: '',
      };

      element = namespace.fromRefract(refracted);
    });

    it('should have a convenience method for retrieving source map', () => {
      expect(element.sourceMapValue).to.be.undefined;
    });
  });
});
