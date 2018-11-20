const R = require('ramda');
const { isAnnotation, isParseResult } = require('./predicates');

/**
 * Retrieve the first value that is not an annotation from a parse result.
 */
// FIXME After https://github.com/refractproject/minim/issues/201
// This should become something like `parseResult.find(R.not(isAnnotation))` or `R.find(R.not(isAnnotation), parseResult)`;
const findValueFromParseResult = parseResult => R.reject(isAnnotation, parseResult.content)[0];

/*
 * Returns true iff the parse result does not contain errors
 * @param parseResult {ParseResult}
 * @returns boolean
 */
const hasNoErrors = parseResult => parseResult.errors.isEmpty;

/**
 * Concatate the lhs and rhs array into a parse result
 * @param lhs {Element[]}
 * @param rhs {Element[]}
 * @returns {ParseResult}
 */
function concatParseResult(minim, lhs, rhs) {
  return new minim.elements.ParseResult(lhs.concat(rhs));
}

/**
 * Performs left-to-right composition of one or more ParseResult-returning
 * functions. The leftmost function may have any arity; the remaining functions
 * must be unary.
 *
 * All of the annotations are collected and merged into the final resultant
 * parse result. Any errors will cause the pipe to fail early.
 *
 * @func
 * @category Function
 * @sig ((a -> ParseResult b), (b -> ParseResult c), ..., (y -> ParseResult z)) -> (a -> ParseResult z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.pipe
 */
function pipeParseResult(minim, ...functions) {
  // Return a closure that takes the element to pipe
  return (element) => {
    const run = (accumulator, func) => {
      let parseResult = func(findValueFromParseResult(accumulator));

      if (!isParseResult(parseResult)) {
        // Result is either a ParseResult, or it is an element that can be
        // wrapped in a parse result
        parseResult = new minim.elements.ParseResult([parseResult]);
      }

      return concatParseResult(minim, parseResult.content, accumulator.annotations.elements);
    };

    return R.reduceWhile(hasNoErrors, run, new minim.elements.ParseResult([element]), functions);
  };
}


module.exports = pipeParseResult;
