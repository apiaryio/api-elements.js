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
 */
function parsePaths(minim, paths) {
  const parseMember = R.cond([
    [isPathField, parsePathItemObject(minim)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new minim.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseMembers = object => R.chain(parseMember, new minim.elements.ParseResult(object.content));

  const parsePaths = pipeParseResult(minim,
    R.unless(isObject, createError(minim, `'${name}' is not an object`)),
    parseMembers);

  return parsePaths(paths);
}

module.exports = R.curry(parsePaths);
