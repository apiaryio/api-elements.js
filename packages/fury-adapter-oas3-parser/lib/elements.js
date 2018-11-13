const R = require('ramda');

function createAnnotation(annotationClass, minim, message, element) {
  const annotation = new minim.elements.Annotation(message);
  annotation.classes = [annotationClass];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return annotation;
}

module.exports.createError = R.curry(createAnnotation)('error');
module.exports.createWarning = R.curry(createAnnotation)('warning');
