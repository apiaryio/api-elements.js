const R = require('ramda');
const {
  isObject, hasKey, isExtension, getValue,
} = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const pipeParseResult = require('../../pipeParseResult');
const parseSchemaObject = require('./parseSchemaObject');

const name = 'Components Object';
const unsupportedKeys = ['responses', 'parameters', 'examples', 'requestBodies', 'headers', 'securitySchemes', 'links', 'callbacks'];
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
  const validateSchemasIsObject = R.unless(isObject,
    createWarning(minim, "'Schemas Object' is not an object"));

  const parseSchemasObject = pipeParseResult(minim,
    validateSchemasIsObject,
    parseObject(minim, parseSchemaObject(minim)));

  const parseMember = R.cond([
    [hasKey('schemas'), R.compose(parseSchemasObject, getValue)],
    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new minim.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseComponents = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    parseObject(minim, parseMember));

  return parseComponents(element);
}


module.exports = R.curry(parseComponentsObject);
