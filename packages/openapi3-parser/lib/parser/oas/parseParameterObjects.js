const R = require('ramda');
const { isArray, hasKey } = require('../../predicates');
const { createWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');

const parseParameterObject = require('./parseParameterObject');
const parseReference = require('../parseReference');

const parseParameterObjectOrRef = parseReference('parameters', parseParameterObject);

// Given MemberElement has key `path` or `query`
const isPathOrQuery = R.either(hasKey('path'), hasKey('query'));

/**
 * Parse parameters array
 * @param namespace
 * @param name {StringElement}
 * @param member {MemberElement} parameters member from an object element
 * @return {ParseResult<ObjectElement>} An object containing parameters grouped
 *   by their `in` value (`path`, `query` etc) as members. The object can
 *   be treated as a "named tuple".
 * @private
 */
function parseParameterObjects(context, name, array) {
  const { namespace } = context;

  const ParseResult = R.constructN(1, namespace.elements.ParseResult);

  // Convert an array of parameters into the correct types
  const convertParameters = R.cond([
    [isPathOrQuery, member => new namespace.elements.HrefVariables(member.value.content.map((element) => {
      const member = element.clone();
      member.explode = element.explode;
      return member;
    }))],
    // FIXME when headers and cookies are supported these should be converted
    [R.T, member => member.clone()],
  ]);

  const parseParameters = pipeParseResult(namespace,
    R.unless(isArray, createWarning(namespace, `'${name}' 'parameters' is not an array`)),
    R.compose(R.chain(parseParameterObjectOrRef(context)), ParseResult),
    (...parameters) => new namespace.elements.Object([...parameters]),
    R.groupBy(parameter => parameter.in),
    parseObject(context, name, convertParameters));

  return parseParameters(array);
}

module.exports = R.curry(parseParameterObjects);
