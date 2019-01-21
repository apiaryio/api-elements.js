const R = require('ramda');
const {
  isAnnotation, isMember, isParseResult, isObject,
} = require('../predicates');
const { createWarning } = require('./annotations');
const pipeParseResult = require('../pipeParseResult');

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
 * A callback for transforming a member element
 *
 * @callback transformMember
 * @param member {MemberElement}
 * @returns {Element} Either a ParseResult to be unwrapped, or an element
 */

/**
 * Function for parsing each member in an object using the given transform callback.
 *
 * The given transform callback can return a parse result containing
 * annotations to be merged into the final parse result.
 *
 * When the transform callback returns an error, parseObject will return a
 * ParseResult only containing errors.
 *
 * If the transform callback returns a parse result without any non-annotation
 * elements then the member will be removed from the resultant object return int he parse result.
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
 * @param namespace
 * @param name {string} - The human readable name of the element. Used for annotation messages.
 * @param transform {transformMember} - The callback to transform a member
 * @param object {ObjectElement} - The object containing members to transform
 *
 * @returns ParseResult<ObjectElement>
 */
function parseObject(context, name, parseMember) {
  const { namespace } = context;

  // Create a member from a key and value
  const createMember = R.constructN(2, namespace.elements.Member);

  // Wraps the given element in a parse result if it isn't already a parse result
  const coerceParseResult = R.unless(isParseResult, element => new namespace.elements.ParseResult([element]));

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
    const object = new namespace.elements.Object(members);
    return new namespace.elements.ParseResult([object].concat(annotations.elements));
  };

  // Create a parse result from an object using all of the members
  const wrapObjectInParseResult = object => new namespace.elements.ParseResult(object.content);

  const validateMembers = R.pipe(
    wrapObjectInParseResult,
    chainParseResult(transformMember),
    R.unless(parseResultHasErrors, convertParseResultMembersToObject)
  );

  return pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    validateMembers);
}


module.exports = parseObject;
