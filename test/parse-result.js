/*
 * Tests for parse result namespace elements, including all their
 * convenience properties and methods.
 */

import chai, {Assertion, expect} from 'chai';

import minim from 'minim';
import minimParseResult from '../src/parse-result';

const namespace = minim.namespace()
  .use(minimParseResult);

const Annotation = namespace.getElementClass('annotation');
const Category = namespace.getElementClass('category');
const ParseResult = namespace.getElementClass('parseResult');
const SourceMap = namespace.getElementClass('sourceMap');
const StringElement = namespace.getElementClass('string');

chai.use((_chai, utils) => {
  /*
   * Asserts that an element has a certain class.
   */
  utils.addMethod(Assertion.prototype, 'class', function hasClass(name) {
    const obj = this._obj;
    this.assert(
      obj.classes.contains(name),
      'Expected class list #{act} to contain #{exp}',
      'Expected class list #{act} to not contain #{exp}',
      name,
      obj.classes.toValue()
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
        meta: {},
        attributes: {},
        content: [
          {
            element: 'annotation',
            meta: {
              classes: ['warning'],
            },
            attributes: {},
            content: [],
          },
          {
            element: 'annotation',
            meta: {
              classes: ['error'],
            },
            attributes: {},
            content: [],
          },
          {
            element: 'category',
            meta: {
              classes: ['api'],
            },
            attributes: {},
            content: [],
          },
        ],
      };

      parseResult = (new ParseResult()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(parseResult.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name parseResult', () => {
      expect(parseResult.element).to.equal('parseResult');
    });

    it('should contain an API', () => {
      const api = parseResult.api;
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
        meta: {},
        attributes: {
          code: 123,
        },
        content: 'Missing argument description',
      };

      annotation = (new Annotation()).fromRefract(refracted);
    });

    it('should round-trip correctly', () => {
      expect(annotation.toRefract()).to.deep.equal(refracted);
    });

    it('should have element name annotation', () => {
      expect(annotation.element).to.equal('annotation');
    });

    it('should get a code', () => {
      expect(annotation.code).to.equal(123);
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
      sourceMap = (new SourceMap()).fromRefract({
        element: 'sourceMap',
        meta: {},
        attributes: {},
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
        meta: {},
        attributes: {
          sourceMap: [
            {
              element: 'sourceMap',
              meta: {},
              attributes: {},
              content: [[1, 2]],
            },
          ],
        },
        content: [],
      };

      element = (new StringElement()).fromRefract(refracted);
      sourceMaps = element.attributes.get('sourceMap');
    });

    it('should round-trip correctly', () => {
      expect(element.toRefract()).to.deep.equal(refracted);
    });

    it('should contain a sourceMap attribute with one item', () => {
      expect(sourceMaps).to.exist;
      expect(sourceMaps).to.have.length(1);
    });

    it('should have the source map location', () => {
      expect(sourceMaps.first().toValue()).to.deep.equal([[1, 2]]);
    });

    it('should serialize with a sourceMap attribute', () => {
      const expected = {
        element: 'string',
        meta: {},
        attributes: {
          sourceMap: [
            {
              element: 'sourceMap',
              meta: {},
              attributes: {},
              content: [[1, 2]],
            },
          ],
        },
        content: [],
      };
      expect(element.toRefract()).to.deep.equal(expected);
    });
  });
});
