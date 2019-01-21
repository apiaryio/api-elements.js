const R = require('ramda');

function createAnnotation(annotationClass, namespace, message, element) {
  const annotation = new namespace.elements.Annotation(message);
  annotation.classes = [annotationClass];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return annotation;
}

const createError = R.curry(createAnnotation)('error');
const createWarning = R.curry(createAnnotation)('warning');

function createUnsupportedMemberWarning(namespace, path, member) {
  const message = `'${path}' contains unsupported key '${member.key.toValue()}'`;
  return createWarning(namespace, message, member.key);
}

function createInvalidMemberWarning(namespace, path, member) {
  const message = `'${path}' contains invalid key '${member.key.toValue()}'`;
  return createWarning(namespace, message, member.key);
}

function createIdentifierNotUniqueWarning(namespace, path, member) {
  return createWarning(namespace, `'${path}' '${member.key.toValue()}' is not a unique identifier: '${member.value.toValue()}'`, member.value);
}

function createMemberValueNotStringWarning(namespace, path, member) {
  return createWarning(namespace, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function createMemberValueNotStringError(namespace, path, member) {
  return createError(namespace, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function createMemberValueNotBooleanWarning(namespace, path, member) {
  return createWarning(namespace, `'${path}' '${member.key.toValue()}' is not a boolean`, member.value);
}

function createMemberValueNotBooleanError(namespace, path, member) {
  return createError(namespace, `'${path}' '${member.key.toValue()}' is not a boolean`, member.value);
}

module.exports = {
  createError,
  createWarning,
  createUnsupportedMemberWarning: R.curry(createUnsupportedMemberWarning),
  createInvalidMemberWarning: R.curry(createInvalidMemberWarning),
  createIdentifierNotUniqueWarning: R.curry(createIdentifierNotUniqueWarning),
  createMemberValueNotStringWarning: R.curry(createMemberValueNotStringWarning),
  createMemberValueNotStringError: R.curry(createMemberValueNotStringError),
  createMemberValueNotBooleanWarning: R.curry(createMemberValueNotBooleanWarning),
  createMemberValueNotBooleanError: R.curry(createMemberValueNotBooleanError),
};
