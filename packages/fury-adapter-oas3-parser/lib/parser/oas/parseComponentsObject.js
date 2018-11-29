const R = require('ramda');
const { isObject, hasKey, isExtension } = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Components Object';
const unsupportedKeys = ['schemas', 'responses', 'parameters', 'examples', 'requestBodies', 'headers', 'securitySchemes', 'links', 'callbacks'];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Parse Components Object
 *
 * @param minim {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsObject
 */
function parseComponentsObject(minim, element) {
  const parseMember = R.cond([
    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseComponents = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    parseObject(minim, parseMember));

  return parseComponents(element);
}


module.exports = R.curry(parseComponentsObject);
