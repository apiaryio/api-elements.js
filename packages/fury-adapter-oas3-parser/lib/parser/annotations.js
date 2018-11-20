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

/*
 * Returns true iff the given element is either an annotation or member element
 * @param element {Element}
 * @returns boolean
 */
const isAnnotationOrMember = R.anyPass([isAnnotation, isMember]);


/**
 * Transform every non-annotation element in the parse result and then flatten all of the results into a parse result
 * @param transform {function}
 * @param parseResult {ParseResult}
 */
const chainParseResult = R.curry((transform, parseResult) => {
  const result = R.chain(transform, parseResult);

  if (!result.errors.isEmpty) {
    return new parseResult.constructor(result.errors);
  }

  return result;
});

const parseResultHasErrors = parseResult => !parseResult.errors.isEmpty;

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
 */
function validateMembers(minim, parseMember, object) {
  // Create a member from a key and value
  const createMember = R.constructN(2, minim.elements.Member);

  // Wraps the given element in a parse result if it isn't already a parse result
  const coerceParseResult = R.unless(isParseResult, element => new minim.elements.ParseResult([element]));

  // Wrap the given parseMember transformation into one that also converts
  // the result to a parse result if it isn't already a parse result.
  const transform = R.pipe(parseMember, coerceParseResult);

  // Wrap the above transform function into one that also converts any
  // values in the parse result that are not annotations or a member
  // into a member using the same key as provided
  const transformMember = (member) => {
    const coerceMember = (R.unless(isAnnotationOrMember, createMember(member.key)));
    return R.map(coerceMember, transform(member));
  };

  /**
   * Converts the given parse result of members into parse result of an object
   * @param parseResult {ParseResult<Member>}
   * @returns ParseResult<Object>
   */
  const convertParseResultMembersToObject = (parseResult) => {
    const members = R.filter(isMember, parseResult);
    const annotations = R.filter(isAnnotation, parseResult);
    const object = new minim.elements.Object(members);
    return new minim.elements.ParseResult([object].concat(annotations.elements));
  };

  // Create a parse result from an object using all of the members
  const wrapObjectInParseResult = object => new minim.elements.ParseResult(object.content);

  const validateMembers = R.pipe(
    wrapObjectInParseResult,
    chainParseResult(transformMember),
    R.unless(parseResultHasErrors, convertParseResultMembersToObject)
  );

  return validateMembers(object);
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
};
