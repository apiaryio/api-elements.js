/*
 * Parse result-specific refract elements.
 *
 * General structure:
 *
 * + ParseResult
 *   + Annotation
 */

const apiDescription = require('./api-description');
const parseResult = require('./elements/parse-result');

const namespace = (options) => {
  parseResult(options.base);

  const minim = options.base;
  const { Element } = minim;
  const StringElement = minim.getElementClass('string');
  const ArrayElement = minim.getElementClass('array');

  /**
   * @class Annotation
   *
   * @param {string} content
   * @param meta
   * @param attributes
   *
   * @extends StringElement
   */
  class Annotation extends StringElement {
    constructor(...args) {
      super(...args);
      this.element = 'annotation';
    }

    get code() {
      return this.attributes.get('code');
    }

    set code(value) {
      this.attributes.set('code', value);
    }
  }

  /**
   * @class SourceMap
   *
   * @param {Array} content
   * @param meta
   * @param attributes
   *
   * @extends ArrayElement
   */
  class SourceMap extends minim.elements.Array {
    constructor(...args) {
      super(...args);
      this.element = 'sourceMap';
    }

    // Override toValue because until Refract 1.0
    // sourceMap is special element that contains array of array
    // TODO Remove in next minor release
    toValue() {
      return this.content.map(value => value.map(element => element.toValue()));
    }
  }

  /**
   * @name sourceMapValue
   * @type Array
   * @memberof Element.prototype
   */
  if (!Object.getOwnPropertyNames(Element.prototype).includes('sourceMapValue')) {
    Object.defineProperty(Element.prototype, 'sourceMapValue', {
      get() {
        const sourceMap = this.attributes.get('sourceMap');

        if (sourceMap) {
          return sourceMap.first.toValue();
        }

        return undefined;
      },
    });
  }

  minim
    .use(apiDescription)
    .register('annotation', Annotation)
    .register('sourceMap', SourceMap);
};

module.exports = { namespace };
