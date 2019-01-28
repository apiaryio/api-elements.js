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

const valueIsObject = R.compose(isObject, getValue);

/**
 * Is the given parse result empty (i.e, contains no elements other than annotations)
 *
 * @param parseResult {ParseResult}
 * @returns boolean
 */
const isParseResultEmpty = parseResult => R.reject(isAnnotation, parseResult).isEmpty;

/**
 * Parse a component member
 *
 * This function takes another parser that is capable of parsing the specific
 * component type (schema parser, parameter parser etc) and parses a
 * component using the given parser. It will return a parse result of member.
 *
 * In the cases that the given member cannot be parsed, it will result in
 * returning a member element to represent the key without a value.
 *
 * @param context
 * @param parser {function}
 * @param member {Member} - Member element to represent the component,
 *   member key contains the reusable component name, value represents
 *   the reusable component
 *
 * @returns ParseResult
 */
const parseComponentMember = R.curry((context, parser, member) => {
  // Create a Member Element with `member.key` as the key
  const Member = R.constructN(2, context.namespace.elements.Member)(member.key);

  const parseResult = pipeParseResult(context.namespace,
    parser(context),
    Member)(member.value);

  if (isParseResultEmpty(parseResult)) {
    // parse result does not contain a member, that's because parsing a
    // component has failed. We want to store the member without value in
    // this case so that we can correctly know if a component with the name
    // existed during dereferencing.
    parseResult.unshift(Member(undefined));
  }

  return parseResult;
});

/**
 * Parse Components Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsObject
 */
function parseComponentsObject(context, element) {
  const { namespace } = context;

  const createMemberValueNotObjectWarning = member => createWarning(namespace,
    `'${name}' '${member.key.toValue()}' is not an object`, member.value);
  const validateIsObject = R.unless(valueIsObject, createMemberValueNotObjectWarning);

  /**
   * Parses a member representing a component object (such as an object
   * representing the parameter components)
   *
   * @param parser {function}
   * @param member {Member}
   *
   * @returns ParseResult
   */
  const parseComponentObjectMember = (parser) => {
    const parseMember = parseComponentMember(context, parser);

    return pipeParseResult(context.namespace,
      validateIsObject,
      R.compose(parseObject(context, name, parseMember), getValue));
  };

  // eslint-disable-next-line no-param-reassign
  const setDataStructureId = (dataStructure, key) => { dataStructure.content.id = key.clone(); };
  const parseSchemas = pipeParseResult(namespace,
    parseComponentObjectMember(parseSchemaObject),
    (object) => {
      object.forEach(setDataStructureId);
      return object;
    });

  const parseMember = R.cond([
    [hasKey('schemas'), parseSchemas],
    [hasKey('parameters'), parseComponentObjectMember(parseParameterObject)],
    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  return parseObject(context, name, parseMember)(element);
}


module.exports = R.curry(parseComponentsObject);
