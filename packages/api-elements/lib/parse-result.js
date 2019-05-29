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
const defineSourceMapValue = require('./define-source-map-value');

const namespace = (options) => {
  parseResult(options.base);
  annotation(options.base);
  sourceMap(options.base);
  defineSourceMapValue(options.base);

  options.base.use(apiDescription);
};

module.exports = { namespace };
