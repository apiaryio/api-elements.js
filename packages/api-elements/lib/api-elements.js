const minim = require('minim');

const apiDescription = require('./api-description');
const ParseResult = require('./elements/ParseResult');
const Annotation = require('./elements/Annotation');
const SourceMap = require('./elements/SourceMap');
const defineSourceMapValue = require('./define-source-map-value');

class Namespace extends minim.Namespace {
  constructor() {
    super();

    this.use(apiDescription);

    this.register('parseResult', ParseResult)
    this.register('annotation', Annotation)
    this.register('sourceMap', SourceMap);

    defineSourceMapValue(this);
  }
}


const namespace = new Namespace();


module.exports = namespace;
module.exports.Namespace = Namespace;
