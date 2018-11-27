const R = require('ramda');
const {
  isObject,
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
const parseString = require('../parseString');
const parseCopy = require('../parseCopy');
const parseOperationObject = require('./parseOperationObject');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Path Item Object';
const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const unsupportedKeys = ['$ref', 'description', 'servers', 'parameters'];

const isHttpMethodKey = R.anyPass(R.map(hasKey, httpMethods));
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Path Item Object
 * @returns Resource
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object
 */
function parsePathItemObject(minim, member) {
  const parseDescription = parseCopy(minim,
    createMemberValueNotStringWarning(minim, name));

  const parseMember = R.cond([
    [hasKey('summary'), parseString(minim, name, false)],
    [hasKey('description'), parseDescription],
    [isHttpMethodKey, parseOperationObject(minim)],

    // FIXME Parse $ref
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

      const methods = pathItem.content
        .filter(isHttpMethodKey)
        .map(getValue);
      resource.content = resource.content.concat(methods);

      return resource;
    });

  return parsePathItem(member.value);
}

module.exports = R.curry(parsePathItemObject);
