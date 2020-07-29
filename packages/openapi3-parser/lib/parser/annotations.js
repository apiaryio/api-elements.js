const R = require('ramda');

function createAnnotation(annotationClass, context, message, element) {
  const annotation = new context.namespace.elements.Annotation(message);
  annotation.classes = [annotationClass];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return annotation;
}

const createError = R.curry(createAnnotation)('error');

function createWarning(context, message, element) {
  if (context.state.hasWarning(message)) {
    return new context.namespace.elements.ParseResult([]);
  }

  const annotation = new context.namespace.elements.Annotation(message);
  annotation.classes = ['warning'];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  context.state.registerWarning(annotation);
  return annotation;
}

function createUnsupportedMemberWarning(context, path, member) {
  const message = `'${path}' contains unsupported key '${member.key.toValue()}'`;
  return createWarning(context, message, member.key);
}

function createInvalidMemberWarning(context, path, member) {
  const message = `'${path}' contains invalid key '${member.key.toValue()}'`;
  return createWarning(context, message, member.key);
}

function createIdentifierNotUniqueWarning(context, path, member) {
  return createWarning(context, `'${path}' '${member.key.toValue()}' is not a unique identifier: '${member.value.toValue()}'`, member.value);
}

function createMemberValueNotStringWarning(context, path, member) {
  return createWarning(context, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function createMemberValueNotStringError(context, path, member) {
  return createError(context, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function createMemberValueNotBooleanWarning(context, path, member) {
  return createWarning(context, `'${path}' '${member.key.toValue()}' is not a boolean`, member.value);
}

function createMemberValueNotBooleanError(context, path, member) {
  return createError(context, `'${path}' '${member.key.toValue()}' is not a boolean`, member.value);
}

module.exports = {
  createError,
  createWarning: R.curry(createWarning),
  createUnsupportedMemberWarning: R.curry(createUnsupportedMemberWarning),
  createInvalidMemberWarning: R.curry(createInvalidMemberWarning),
  createIdentifierNotUniqueWarning: R.curry(createIdentifierNotUniqueWarning),
  createMemberValueNotStringWarning: R.curry(createMemberValueNotStringWarning),
  createMemberValueNotStringError: R.curry(createMemberValueNotStringError),
  createMemberValueNotBooleanWarning: R.curry(createMemberValueNotBooleanWarning),
  createMemberValueNotBooleanError: R.curry(createMemberValueNotBooleanError),
};
