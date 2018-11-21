const R = require('ramda');
const { isObject, isExtension, getValue } = require('../predicates');
const {
  createError,
  createWarning,
  createInvalidMemberWarning,
} = require('./annotations');
const pipeParseResult = require('../pipeParseResult');

const name = 'Paths Object';

// Returns true if the member's key starts with a slash
const isPathField = member => member.key.toValue().startsWith('/');

/**
 * Parse a Path Item Object
 * @returns Resource
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object
 */
const parsePathItem = R.curry((minim, member) => {
  const resource = new minim.elements.Resource();
  resource.href = member.key.clone();
  // FIXME Parse $ref
  // FIXME Parse summary
  // FIXME Parse description
  // FIXME Parse methods
  // FIXME Parse servers
  // FIXME Parse parameters
  return resource;
});


/**
 * @returns ParseResult<Resource>
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathsObject
 */
function parsePaths(minim, paths) {
  const parseMember = R.cond([
    [isPathField,
      R.ifElse(R.compose(isObject, getValue),
        parsePathItem(minim),
        createWarning(minim, "'Path Item Object' is not an object")),
    ],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseMembers = object => R.chain(parseMember, new minim.elements.ParseResult(object.content));

  const parsePaths = pipeParseResult(minim,
    R.unless(isObject, createError(minim, `'${name}' is not an object`)),
    parseMembers);

  return parsePaths(paths);
}

module.exports = R.curry(parsePaths);
