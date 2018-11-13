const R = require('ramda');
const { isAnnotation, isMember, isParseResult } = require('../predicates');

function createAnnotation(annotationClass, minim, message, element) {
  const annotation = new minim.elements.Annotation(message);
  annotation.classes = [annotationClass];
  annotation.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return annotation;
}

const createError = R.curry(createAnnotation)('error');
const createWarning = R.curry(createAnnotation)('warning');

function createUnsupportedMemberWarning (minim, path, member) {
  const message = `'${path}' contains unsupported key '${member.key.toValue()}'`;
  return createWarning(minim, message, member.key);
}

function createInvalidMemberWarning (minim, path, member) {
  const message = `'${path}' contains invalid key '${member.key.toValue()}'`;
  return createWarning(minim, message, member.key);
}

function createMemberValueNotStringWarning(minim, path, member) {
  return createWarning(minim, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function createMemberValueNotStringError(minim, path, member) {
  return createError(minim, `'${path}' '${member.key.toValue()}' is not a string`, member.value);
}

function validateObjectContainsRequiredKeys(minim, path, requiredKeys, object) {
  const hasMember = key => {
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
  } else {
    return new minim.elements.ParseResult([object]);
  }
}

/**
 * Transforms each member in an object.
 *
 * Splits up each member from an object, invokes the given parseMember
 * transformation and then reconstructs a parse result containing all
 * of the results.
 *
 * |-------->-------->--------------------->---------------------|
 * |        > member > parseMember(member) >                     |
 * | Object > member > parseMember(member) > ParseResult<Object> |
 * |        > member > parseMember(member) >                     |
 * |-------->-------->--------------------->---------------------|
 *
 * @param minim
 * @param parseMember {Function}
 * @param object {ObjectElement}
 *
 * @returns ParseResult
 **/
function validateMembers(minim, parseMember, object) {
  const createMember = R.constructN(2, minim.elements.Member);
  const isAnnotationOrMember = R.anyPass([isAnnotation, isMember]);

  // Wraps the given element in a parse result if it isn't already a parse result
  const coerceParseResult = R.unless(isParseResult, element => new minim.elements.ParseResult([element]));

  // To make using `validateMembers` simpler, we are going to wrap `parseMember`
  // so that parseMember can be another parser and we can wrap the result in
  // a member if it isn't.
  const convertMember = member => {
    // Wraps the given element to a member if it is not a member element or annotation
    const coerceMember = R.map(R.unless(isAnnotationOrMember, createMember(member.key)));

    const parse = R.pipe(
      parseMember,
      coerceParseResult,
      coerceMember
    )

    return parse(member);
  };

  const chain = R.chain(convertMember, new minim.elements.ParseResult(object.content));

  if (!chain.errors.isEmpty) {
    return new minim.elements.ParseResult(chain.errors)
  }

  const result = new minim.elements.Object(R.filter(isMember, chain))
  return new minim.elements.ParseResult([result].concat(chain.annotations.elements));
}


module.exports = {
  createError,
  createWarning,
  createUnsupportedMemberWarning: R.curry(createUnsupportedMemberWarning),
  createInvalidMemberWarning: R.curry(createInvalidMemberWarning),
  createMemberValueNotStringWarning: R.curry(createMemberValueNotStringWarning),
  createMemberValueNotStringError: R.curry(createMemberValueNotStringError),
  validateObjectContainsRequiredKeys: R.curry(validateObjectContainsRequiredKeys),
  validateMembers: R.curry(validateMembers),
}
