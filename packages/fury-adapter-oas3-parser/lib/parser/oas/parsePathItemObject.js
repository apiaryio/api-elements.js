const R = require('ramda');
const {
  isObject,
  isString,
  isExtension,
  hasKey,
  getValue,
} = require('../../predicates');
const {
  createWarning,
  createInvalidMemberWarning,
  createMemberValueNotStringWarning,
  createUnsupportedMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Path Item Object';
const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const unsupportedKeys = ['$ref', 'description', 'servers', 'parameters'].concat(httpMethods);
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Path Item Object
 * @returns Resource
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object
 */
function parsePathItemObject(minim, member) {
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
    parseObject(minim, parseMember),
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
}

module.exports = R.curry(parsePathItemObject);
