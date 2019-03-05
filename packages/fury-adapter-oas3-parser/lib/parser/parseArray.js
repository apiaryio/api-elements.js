const R = require('ramda');
const {
  isAnnotation, isParseResult, isArray,
} = require('../predicates');
const { createWarning } = require('./annotations');
const pipeParseResult = require('../pipeParseResult');

const parseResultHasErrors = parseResult => !parseResult.errors.isEmpty;

/**
 * Transform every non-annotation element in the parse result and then flatten all of the results into a parse result
 * @param transform {function}
 * @param parseResult {ParseResult}
 * @private
 */
const chainParseResult = R.curry((transform, parseResult) => {
  const result = R.chain(transform, parseResult);

  if (!result.errors.isEmpty) {
    return new parseResult.constructor(result.errors);
  }

  return result;
});

/**
 * A callback for transforming an element
 *
 * @callback transformValue
 * @param element {Element}
 * @returns {Element} Either a ParseResult to be unwrapped, or an element
 * @private
 */

/**
 * Function for parsing each value in an array using the given transform callback.
 *
 * The given transform callback can return a parse result containing
 * annotations to be merged into the final parse result.
 *
 * When the transform callback returns an error, parseArray will return a
 * ParseResult only containing errors.
 *
 * If the transform callback returns a parse result without any non-annotation
 * elements then the member will be removed from the resultant object return in the parse result.
 *
 * Splits up each value from an array, invokes the given parseValue
 * transformation and then reconstructs a parse result containing all
 * of the results.
 *
 * |------->------->------------------->--------------------|
 * |       > value > parseValue(value) >                    |
 * | Array > value > parseValue(value) > ParseResult<Array> |
 * |       > value > parseValue(value) >                    |
 * |------->------->------------------->--------------------|
 *
 * @param context
 * @param name {string} - The human readable name of the element. Used for annotation messages.
 * @param transform {transformValue} - The callback to transform an element
 * @param array {ArrayElement} - The array containing values to transform
 *
 * @returns {ParseResult<ArrayElement>}
 * @private
 */
function parseArray(context, name, parseValue) {
  const { namespace } = context;

  // Wraps the given element in a parse result if it isn't already a parse result
  const coerceParseResult = R.unless(isParseResult, element => new namespace.elements.ParseResult([element]));

  // Wrap the given parseValue transformation into one that also converts
  // the result to a parse result if it isn't already a parse result.
  const transform = R.pipe(parseValue, coerceParseResult);

  /**
   * Converts the given parse result of values into parse result of an array
   * @param parseResult {ParseResult<Element>}
   * @returns {ParseResult<Array>}
   * @private
   */
  const convertParseResultMembersToArray = (parseResult) => {
    const values = R.reject(isAnnotation, parseResult);
    const annotations = R.filter(isAnnotation, parseResult);
    const array = new namespace.elements.Array(values);
    return new namespace.elements.ParseResult([array].concat(annotations.elements));
  };

  // Create a parse result from an array using all of the members
  const wrapArrayInParseResult = array => new namespace.elements.ParseResult(array.content);

  const validateValues = R.pipe(
    wrapArrayInParseResult,
    chainParseResult(transform),
    R.unless(parseResultHasErrors, convertParseResultMembersToArray)
  );

  return pipeParseResult(namespace,
    R.unless(isArray, createWarning(namespace, `'${name}' is not an array`)),
    validateValues);
}

module.exports = parseArray;
