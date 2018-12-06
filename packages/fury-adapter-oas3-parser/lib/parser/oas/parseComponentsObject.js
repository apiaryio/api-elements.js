const R = require('ramda');
const {
  isObject, isAnnotation, hasKey, isExtension, getValue,
} = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const pipeParseResult = require('../../pipeParseResult');
const parseSchemaObject = require('./parseSchemaObject');
const parseParameterObject = require('./parseParameterObject');

const name = 'Components Object';
const unsupportedKeys = ['responses', 'examples', 'requestBodies', 'headers', 'securitySchemes', 'links', 'callbacks'];
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
  const validateIsObject = key => R.unless(isObject,
    createWarning(minim, `'${name}' '${key}' is not an object`));

  const parseSchemasObject = pipeParseResult(minim,
    validateIsObject('schemas'),
    parseObject(minim, parseSchemaObject(minim)));

  const parseParametersObjectMember = (member) => {
    // Create a Member Element with `member.key` as the key
    const Member = R.constructN(2, minim.elements.Member)(member.key);
    const parseResult = parseParameterObject(minim, member.value);
    // Wrap non-annotation elements in member element
    return R.map(R.unless(isAnnotation, Member), parseResult);
  };

  const parseParametersObject = pipeParseResult(minim,
    validateIsObject('parameters'),
    parseObject(minim, parseParametersObjectMember));

  const parseMember = R.cond([
    [hasKey('schemas'), R.compose(parseSchemasObject, getValue)],
    [hasKey('parameters'), R.compose(parseParametersObject, getValue)],
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
