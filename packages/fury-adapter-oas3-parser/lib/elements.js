const R = require('ramda');

function createError(minim, message, element) {
  const annotation = new minim.elements.Annotation(message);
  annotation.classes = ['error'];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return annotation;
}

module.exports.createError = R.curry(createError);
