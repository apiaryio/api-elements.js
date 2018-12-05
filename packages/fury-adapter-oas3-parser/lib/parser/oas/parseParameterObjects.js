const R = require('ramda');
const { isArray, hasKey } = require('../../predicates');
const {
  createWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');

const parseParameterObject = require('./parseParameterObject');

// Given MemberElement has key `path` or `query`
const isPathOrQuery = R.anyPass([hasKey('path'), hasKey('query')]);

/**
 * Parse parameters array
 * @param minim
 * @param name {StringElement}
 * @param member {MemberElement} parameters member from an object element
 * @return {ParseResult<ObjectElement>} An object containing parameters grouped
 *   by their `in` value (`path`, `query` etc) as members. The object can
 *   be treated as a "named tuple".
 */
function parseParameterObjects(minim, name, array) {
  const ParseResult = R.constructN(1, minim.elements.ParseResult);

  // Convert an array of parameter into the correct types
  const convertParameters = R.cond([
    [isPathOrQuery, member => new minim.elements.HrefVariables(member.value.content)],
    // FIXME when headers and cookies are supported these should be converted
    [R.T, member => member],
  ]);

  const parseParameters = pipeParseResult(minim,
    R.unless(isArray, createWarning(minim, `'${name}' 'parameters' is not an array`)),
    R.compose(R.chain(parseParameterObject(minim)), ParseResult),
    (...parameters) => new minim.elements.Object([...parameters]),
    R.groupBy(parameter => parameter.in),
    parseObject(minim, convertParameters));

  return parseParameters(array);
}

module.exports = R.curry(parseParameterObjects);
