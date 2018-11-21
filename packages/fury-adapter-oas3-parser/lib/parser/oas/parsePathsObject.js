const R = require('ramda');
const {
  isObject,
  isString,
  isExtension,
  hasKey,
  getValue,
} = require('../../predicates');
const {
  createError,
  createWarning,
  createInvalidMemberWarning,
  createMemberValueNotStringWarning,
  createUnsupportedMemberWarning,
  validateMembers,
} = require('../annotations');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Paths Object';

// Returns true if the member's key starts with a slash
const isPathField = member => member.key.toValue().startsWith('/');

/**
 * Parse a Path Item Object
 * @returns Resource
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object
 */
const parsePathItem = R.curry((minim, member) => {
  const name = 'Path Item Object';

  const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
  const unsupportedKeys = ['$ref', 'description', 'servers', 'parameters'].concat(httpMethods);
  const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

  /**
   * Ensures that the given member value is a string, or return error
   *
   * @param member {MemberElement}
   *
   * @returns {Element} Either a MemberElement<String> or Annotation.
   */
  const memberIsStringOrWarning = R.unless(
    R.compose(isString, getValue),
    createMemberValueNotStringWarning(minim, name)
  );

  const parseDescription = parseCopy(minim,
    createMemberValueNotStringWarning(minim, name));

  const parseMember = R.cond([
    [hasKey('summary'), memberIsStringOrWarning],
    [hasKey('description'), parseDescription],

    // FIXME Parse $ref
    // FIXME Parse methods
    // FIXME Parse servers
    // FIXME Parse parameters

    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parsePathItem = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    validateMembers(minim, parseMember),
    (pathItem) => {
      const resource = new minim.elements.Resource();
      resource.href = member.key.clone();

      const summary = pathItem.get('summary');
      if (summary) {
        resource.title = summary.clone();
      }

      const description = pathItem.get('description');
      if (description) {
        resource.push(description);
      }

      return resource;
    });

  return parsePathItem(member.value);
});


/**
 * @returns ParseResult<Resource>
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathsObject
 */
function parsePaths(minim, paths) {
  const parseMember = R.cond([
    [isPathField, parsePathItem(minim)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

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
