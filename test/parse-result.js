/*
 * Tests for parse result namespace elements, including all their
 * convenience properties and methods.
 */

import chai, {Assertion, expect} from 'chai';

import minim from 'minim';
import minimParseResult from '../src/parse-result';

const namespace = minim.namespace()
  .use(minimParseResult);

const Category = namespace.getElementClass('category');
const ParseResult = namespace.getElementClass('parseResult');
const Annotation = namespace.getElementClass('annotation');
const SourceMap = namespace.getElementClass('sourceMap');

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

    beforeEach(() => {
      parseResult = (new ParseResult()).fromCompactRefract([
        'parseResult', {}, {}, [
          ['annotation', {classes: ['warning']}, {}, []],
          ['annotation', {classes: ['error']}, {}, []],
          ['category', {classes: ['api']}, {}, []],
        ],
      ]);
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

    beforeEach(() => {
      annotation = (new Annotation()).fromCompactRefract([
        'annotation', {}, {code: 123}, 'Missing argument description',
      ]);
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
      sourceMap = (new SourceMap()).fromCompactRefract([
        'sourceMap', {}, {}, [],
      ]);
    });

    it('should have element name sourceMap', () => {
      expect(sourceMap.element).to.equal('sourceMap');
    });
  });
});
