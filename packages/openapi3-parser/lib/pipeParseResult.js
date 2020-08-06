const R = require('ramda');
const { isAnnotation, isParseResult } = require('./predicates');

/*
 * Returns true iff the parse result does not contain errors
 * @param parseResult {ParseResult}
 * @returns boolean
 * @private
 */
const hasNoErrors = parseResult => parseResult.errors.isEmpty;

/*
 * Returns true iff the parse result contains non-annotation values
 * @param parseResult {ParseResult}
 * @returns boolean
 * @private
 */
const hasValue = parseResult => !R.reject(isAnnotation, parseResult).isEmpty;

/*
 * Returns true if the parse result contains no errors and contains non-annotation values.
 * @param parseResult {ParseResult}
 * @returns boolean
 */
const hasNoErrorsAndHasValue = R.both(hasNoErrors, hasValue);

/**
 * Concatate the lhs and rhs array into a parse result
 * @param lhs {Element[]}
 * @param rhs {Element[]}
 * @returns {ParseResult}
 * @private
 */
function concatParseResult(namespace, lhs, rhs) {
  return new namespace.elements.ParseResult(lhs.concat(rhs));
}

/**
 * Performs left-to-right composition of one or more ParseResult-returning
 * functions. The leftmost function may have any arity; the remaining functions
 * must be unary.
 *
 * All of the annotations are collected and merged into the final resultant
 * parse result. The pipe will only continue if the function returns a
 * value, if the function returns an error, the pipe will also fail early.
 *
 * @func
 * @category Function
 * @sig ((a -> ParseResult b), (b -> ParseResult c), ..., (y -> ParseResult z)) -> (a -> ParseResult z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.pipe
 * @private
 */
function pipeParseResult(namespace, ...functions) {
  // Return a closure that takes the element to pipe
  return (element) => {
    const run = (accumulator, func) => {
      const elements = R.reject(isAnnotation, accumulator);
      let parseResult = func(...elements);

      if (!isParseResult(parseResult)) {
        // Result is either a ParseResult, or it is an element that can be
        // wrapped in a parse result
        parseResult = new namespace.elements.ParseResult([parseResult]);
      }

      return concatParseResult(namespace, parseResult.content, accumulator.annotations.elements);
    };

    return R.reduceWhile(hasNoErrorsAndHasValue, run, new namespace.elements.ParseResult([element]), functions);
  };
}


module.exports = pipeParseResult;
