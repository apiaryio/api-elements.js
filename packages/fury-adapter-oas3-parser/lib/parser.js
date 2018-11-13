const R = require('ramda');
const parseYAML = require('./parser/yaml');

const { isAnnotation, isObject } = require('./predicates');

const isObjectOrAnnotation = R.either(isObject, isAnnotation);

function parse(source, minim) {
  const createError = R.curry((message, element) => {
    const annotation = new minim.elements.Annotation(message);
    annotation.classes = ['error'];
    annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
    return annotation;
  });

  // parseOASObject - Right now OAS Object is unsupported and returns annotation
  const parseOASObject = createError('OpenAPI 3 is unsupported');

  const document = parseYAML(source, minim);

  const parseDocument = R.compose(
    R.unless(isAnnotation, parseOASObject),
    R.unless(isObjectOrAnnotation, createError('Source document is not an object'))
  )

  return R.map(parseDocument, document)
}

module.exports = parse;
