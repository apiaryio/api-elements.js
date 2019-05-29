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
const annotation = require('./elements/annotation');
const sourceMap = require('./elements/source-map');

const namespace = (options) => {
  const namespace = options.base;
  const { Element } = namespace;

  parseResult(namespace);
  annotation(options.base);
  sourceMap(options.base);

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

  namespace.use(apiDescription);
};

module.exports = { namespace };
