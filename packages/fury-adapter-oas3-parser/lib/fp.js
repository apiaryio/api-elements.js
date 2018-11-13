const R = require('ramda');
const { isAnnotation, isParseResult } = require('./predicates');

/**
 * Retrieve the first value that is not an annotation from a parse result.
 */
// FIXME After https://github.com/refractproject/minim/issues/201
// This should become something like `parseResult.find(R.not(isAnnotation))` or `R.find(R.not(isAnnotation), parseResult)`;
const findValueFromParseResult = parseResult => R.reject(isAnnotation, parseResult.content)[0];

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
function pipeParseResult() {
  const minim = arguments[0];
  const functions = R.tail(arguments);

  return (value) => {
    const earlyExit = result => result.errors.isEmpty;

    const run = (accumulator, func) => {
      let parseResult = func(findValueFromParseResult(accumulator));

      if (!isParseResult(parseResult)) {
        // Wrap bare element in ParseResult
        parseResult = new minim.elements.ParseResult([parseResult]);
      }

      // Attach prior annotations
      parseResult.content = parseResult.content.concat(accumulator.annotations.elements);

      return parseResult;
    };

    return R.reduceWhile(earlyExit, run, new minim.elements.ParseResult([value]), functions);
  };
}


module.exports = {
  pipeParseResult,
};
