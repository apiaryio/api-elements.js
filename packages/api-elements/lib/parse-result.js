/*
 * Parse result-specific refract elements.
 *
 * General structure:
 *
 * + ParseResult
 *   + Annotation
 */

const apiDescription = require('./api-description');
const ParseResult = require('./elements/ParseResult');
const Annotation = require('./elements/Annotation');
const SourceMap = require('./elements/SourceMap');
const defineSourceMapValue = require('./define-source-map-value');

const namespace = (options) => {
  options.base
    .register('parseResult', ParseResult)
    .register('annotation', Annotation)
    .register('sourceMap', SourceMap);

  defineSourceMapValue(options.base);

  options.base.use(apiDescription);
};

module.exports = { namespace };
