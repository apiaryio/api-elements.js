const R = require('ramda');
const parseYAML = require('./parser/yaml');

const { unlessAnnotation } = require('./predicates');

function parse(source, minim) {
  const unsupportedElement = () => {
    const annotation = new minim.elements.Annotation('OpenAPI 3 is unsupported');
    annotation.classes = ['error'];
    return annotation;
  }

  const document = parseYAML(source, minim);
  return R.map(unlessAnnotation(unsupportedElement), document);
}

module.exports = parse;
