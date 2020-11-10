const R = require('ramda');
const {
  isObject, isString, isExtension, getKey,
} = require('../../predicates');
const { createError, createWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parsePathItemObject = require('./parsePathItemObject');

const name = 'Paths Object';

// Returns true if the member's key is a string, and starts with a slash
const isPathField = R.compose(R.both(isString, key => key.toValue().startsWith('/')), getKey);
const isKeyString = R.compose(isString, getKey);

/**
 * Parse Paths Object
 * @returns ParseResult<Resource>
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathsObject
 * @private
 */
function parsePaths(context, paths) {
  const { namespace } = context;

  const createParseResult = annotation => new namespace.elements.ParseResult([annotation]);
  const createPathNotStringWarning = member => createWarning(namespace,
    `'${name}' path must be a string, found ${member.key.element}`,
    member.value);
  const createKeyNotPathOrExtensionWarning = member => createWarning(namespace,
    `'${name}' contains invalid key '${member.key.toValue()}', key must be a path starting with a leading forward slash '/', or an extension starting with 'x-'`,
    member.value);

  const parseMember = R.cond([
    [isPathField, parsePathItemObject(context)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [isKeyString, R.compose(createParseResult, createKeyNotPathOrExtensionWarning)],
    [R.T, R.compose(createParseResult, createPathNotStringWarning)],
  ]);

  const parseMembers = object => R.chain(parseMember, new namespace.elements.ParseResult(object.content));

  const parsePaths = pipeParseResult(namespace,
    R.unless(isObject, createError(namespace, `'${name}' is not an object`)),
    parseMembers);

  return parsePaths(paths);
}

module.exports = R.curry(parsePaths);
