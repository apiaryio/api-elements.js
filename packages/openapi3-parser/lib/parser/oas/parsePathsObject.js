const R = require('ramda');
const { isObject, isExtension } = require('../../predicates');
const { createError, createInvalidMemberWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parsePathItemObject = require('./parsePathItemObject');

const name = 'Paths Object';

// Returns true if the member's key starts with a slash
const isPathField = member => member.key.toValue().startsWith('/');

/**
 * Parse Paths Object
 * @returns ParseResult<Resource>
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathsObject
 * @private
 */
function parsePaths(context, paths) {
  const { namespace } = context;

  const createParseResult = annotation => new namespace.elements.ParseResult([annotation]);

  const parseMember = R.cond([
    [isPathField, parsePathItemObject(context)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, R.compose(createParseResult, createInvalidMemberWarning(namespace, name))],
  ]);

  const parseMembers = object => R.chain(parseMember, new namespace.elements.ParseResult(object.content));

  const parsePaths = pipeParseResult(namespace,
    R.unless(isObject, createError(namespace, `'${name}' is not an object`)),
    parseMembers);

  return parsePaths(paths);
}

module.exports = R.curry(parsePaths);
