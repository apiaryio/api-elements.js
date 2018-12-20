const R = require('ramda');

function createAnnotation(annotationClass, namespace, message, element) {
  const annotation = new namespace.elements.Annotation(message);
  annotation.classes = [annotationClass];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return annotation;
}

module.exports.createError = R.curry(createAnnotation)('error');
module.exports.createWarning = R.curry(createAnnotation)('warning');
