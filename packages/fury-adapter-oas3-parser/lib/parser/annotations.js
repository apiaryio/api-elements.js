const R = require('ramda');
const { isMember } = require('../predicates');

function createAnnotation(annotationClass, minim, message, element) {
  const annotation = new minim.elements.Annotation(message);
  annotation.classes = [annotationClass];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return annotation;
}

const createError = R.curry(createAnnotation)('error');
const createWarning = R.curry(createAnnotation)('warning');

function createUnsupportedMemberWarning(minim, path, member) {
  const message = `'${path}' contains unsupported key '${member.key.toValue()}'`;
  return createWarning(minim, message, member.key);
}

function createInvalidMemberWarning(minim, path, member) {
  const message = `'${path}' contains invalid key '${member.key.toValue()}'`;
  return createWarning(minim, message, member.key);
}

function createMemberValueNotStringWarning(minim, path, member) {
  return createWarning(minim, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function createMemberValueNotStringError(minim, path, member) {
  return createError(minim, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function createMemberValueNotBooleanWarning(minim, path, member) {
  return createWarning(minim, `'${path}' '${member.key.toValue()}' is not a boolean`, member.value);
}

function createMemberValueNotBooleanError(minim, path, member) {
  return createError(minim, `'${path}' '${member.key.toValue()}' is not a boolean`, member.value);
}

function validateObjectContainsRequiredKeys(minim, path, requiredKeys, object) {
  // FIXME Can be simplified once https://github.com/refractproject/minim/issues/201 is completed
  const hasMember = (key) => {
    const findKey = R.allPass([isMember, member => member.key.toValue() === key]);
    const matchingMembers = object.content.filter(findKey);
    return matchingMembers.length > 0;
  };

  const missingKeys = R.reject(hasMember, requiredKeys);
  const errorFromKey = key => createError(minim, `'${path}' is missing required property '${key}'`, object);

  if (missingKeys.length > 0) {
    return new minim.elements.ParseResult(
      R.map(errorFromKey, missingKeys)
    );
  }

  return new minim.elements.ParseResult([object]);
}

module.exports = {
  createError,
  createWarning,
  createUnsupportedMemberWarning: R.curry(createUnsupportedMemberWarning),
  createInvalidMemberWarning: R.curry(createInvalidMemberWarning),
  createMemberValueNotStringWarning: R.curry(createMemberValueNotStringWarning),
  createMemberValueNotStringError: R.curry(createMemberValueNotStringError),
  createMemberValueNotBooleanWarning: R.curry(createMemberValueNotBooleanWarning),
  createMemberValueNotBooleanError: R.curry(createMemberValueNotBooleanError),
  validateObjectContainsRequiredKeys: R.curry(validateObjectContainsRequiredKeys),
};
