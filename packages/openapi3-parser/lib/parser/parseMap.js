const R = require('ramda');
const pipeParseResult = require('../pipeParseResult');
const {
  isObject, getValue, isAnnotation,
} = require('../predicates');
const { createWarning } = require('./annotations');
const parseObject = require('./parseObject');

const validateMapValueIsObject = (namespace, name, key) => R.unless(R.pipe(getValue, isObject), createWarning(namespace, `'${name}' '${key}' is not an object`));

const isParseResultEmpty = parseResult => R.reject(isAnnotation, parseResult).isEmpty;

const parseMapMember = R.curry((context, parser, member) => {
  // Create a Member Element with `member.key` as the key
  const Member = R.constructN(2, context.namespace.elements.Member)(member.key);

  const parseResult = R.map(
    R.unless(isAnnotation, Member),
    parser(context, member.value)
  );

  if (isParseResultEmpty(parseResult)) {
    // parse result does not contain a member, that's because parsing a
    // component has failed. We want to store the member without value in
    // this case so that we can correctly know if a component with the name
    // existed during dereferencing.
    parseResult.unshift(Member(undefined));
  }

  return parseResult;
});

/**
 * Parses map representig
 *
 * @param parser {function}
 * @param member {Member}
 *
 * @returns ParseResult
 * @private
 */
const parseMap = (context, name, key, valueParser) => pipeParseResult(context.namespace,
  validateMapValueIsObject(context.namespace, name, key),
  R.compose(parseObject(context, name, parseMapMember(context, valueParser)), getValue));


module.exports = R.curry(parseMap);
