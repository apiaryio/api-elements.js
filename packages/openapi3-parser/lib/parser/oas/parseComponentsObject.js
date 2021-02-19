const R = require('ramda');
const {
  isObject, isAnnotation, hasKey, isExtension, getKey, getValue,
} = require('../../predicates');
const {
  createError,
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseReference = require('../parseReference');
const pipeParseResult = require('../../pipeParseResult');
const parseSchemaObject = require('./parseSchemaObject');
const parseParameterObject = require('./parseParameterObject');
const parseResponseObject = require('./parseResponseObject');
const parseRequestBodyObject = require('./parseRequestBodyObject');
const parseHeaderObject = require('./parseHeaderObject');
const parseExampleObject = require('./parseExampleObject');
const parseSecuritySchemeObject = require('./parseSecuritySchemeObject');

const name = 'Components Object';
const unsupportedKeys = ['links', 'callbacks'];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const valueIsObject = R.compose(isObject, getValue);

/**
 * Is the given parse result empty (i.e, contains no elements other than annotations)
 *
 * @param parseResult {ParseResult}
 * @returns boolean
 * @private
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
 * @private
 */
const parseComponentMember = R.curry((context, parser, member) => {
  // Create a Member Element with `member.key` as the key
  const Member = R.constructN(2, context.namespace.elements.Member)(member.key);

  const parseResult = R.map(
    R.unless(isAnnotation, Member),
    parser(context, member.value)
  );

  if (isParseResultEmpty(parseResult)) {
    // parse result does not contain a member, that's because parsing a
    // component has failed. We want to store the member without value in
    // this case so that we can correctly know if a component with the name
    // existed during dereferencing.
    parseResult.unshift(Member(undefined));
  }

  return parseResult;
});

function registerComponentStateInContext(context, components) {
  const { namespace } = context;

  // Component referencing supports recursive (and circular in some cases)
  // references and thus we must know about all of the component IDs upfront.
  // Below we are putting in the unparsed components so we can keep the
  // dereferencing logic simple, these are used during parsing the components
  // and later on the components in our context is replaced by the final parsed
  // result.
  // eslint-disable-next-line no-param-reassign
  context.state.components = new namespace.elements.Object();

  if (isObject(components)) {
    components.forEach((value, key) => {
      if (isObject(value)) {
        // Take each component object (f.e schemas, parameters) and convert to
        // object with members for each key (discarding value). We don't want the
        // value making it into final parse results under any circumstance, for
        // example if the parse errors out and we leave bad state

        const componentObject = new namespace.elements.Object(
          value.map((value, key) => new namespace.elements.Member(key))
        );

        context.state.components.set(key.toValue(), componentObject);
      }
    });
  }
}

/**
 * Parse Components Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsObject
 * @private
 */
function parseComponentsObject(context, element) {
  const { namespace } = context;

  registerComponentStateInContext(context, element);

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
   * @returns ParseResult<ObjectElement>
   * @private
   */
  const parseComponentObjectMember = R.curry((parser, member) => {
    const component = member.key.toValue();

    const createKeyIsReservedError = key => createError(
      namespace,
      `'${name}' '${component}' contains a reserved key '${key.toValue()}' which is not currently supported by this parser`,
      key
    );
    const isReservedKey = key => namespace.elementMap[key.toValue()] !== undefined;
    const validateKeyIsNotReservedKey = R.when(
      R.compose(isReservedKey, getKey),
      R.compose(createKeyIsReservedError, getKey)
    );

    const parseMember = parseComponentMember(context, parser);
    const parseMemberOrRef = pipeParseResult(namespace,
      validateKeyIsNotReservedKey,
      m => parseReference(component, () => parseMember(m), context, m.value, false, true));

    return pipeParseResult(context.namespace,
      validateIsObject,
      R.compose(parseObject(context, name, parseMemberOrRef), getValue),
      (object) => {
        const contextMember = context.state.components.getMember(component);

        if (contextMember) {
          contextMember.value = object;
        }

        return object;
      })(member);
  });

  const setDataStructureId = (dataStructure, key) => {
    if (dataStructure) {
      // eslint-disable-next-line no-param-reassign
      dataStructure.content.id = key.clone();
    }
  };
  const parseSchemas = pipeParseResult(namespace,
    parseComponentObjectMember(parseSchemaObject),
    (object) => {
      object.forEach(setDataStructureId);
      return object;
    });

  const parseSecuritySchemes = pipeParseResult(namespace,
    parseComponentObjectMember(parseSecuritySchemeObject),
    (object) => {
      const parseResult = new namespace.elements.ParseResult([]);
      const array = new namespace.elements.Array([]);

      object.forEach((value, key) => {
        const keyValue = key.toValue();

        if (value) {
          if (value instanceof namespace.elements.AuthScheme) {
            if (!context.registerScheme(keyValue)) {
              parseResult.push(createWarning(namespace,
                `'${keyValue}' security scheme is already defined`, key));
            } else {
              // eslint-disable-next-line no-param-reassign
              value.id = key.clone();
              array.push(value);
            }

            return;
          }

          // append oauth2 flow names
          value.forEach((flow) => {
            const flowSchemeName = `${keyValue} ${flow.grantTypeValue}`;

            if (!context.oauthFlow(keyValue, flowSchemeName)) {
              parseResult.push(createWarning(namespace,
                `'${flowSchemeName}' security scheme can't be created from '${keyValue}' security scheme because it is already defined`, key));
            } else {
              // eslint-disable-next-line no-param-reassign
              flow.id = flowSchemeName;
              array.push(flow);
            }
          });
        }
      });

      if (!array.isEmpty) {
        parseResult.push(array);
      }

      return parseResult;
    });

  const isOpenAPI31OrHigher = () => context.isOpenAPIVersionMoreThanOrEqual(3, 1);
  const parseMember = R.cond([
    [hasKey('schemas'), parseSchemas],
    [hasKey('parameters'), parseComponentObjectMember(parseParameterObject)],
    [hasKey('responses'), parseComponentObjectMember(parseResponseObject)],
    [hasKey('requestBodies'), parseComponentObjectMember(parseRequestBodyObject)],
    [hasKey('examples'), parseComponentObjectMember(parseExampleObject)],
    [hasKey('headers'), parseComponentObjectMember(parseHeaderObject)],
    [hasKey('securitySchemes'), parseSecuritySchemes],
    [R.both(hasKey('pathItems'), isOpenAPI31OrHigher), createUnsupportedMemberWarning(namespace, name)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const order = ['schemas', 'headers'];
  return parseObject(context, name, parseMember, [], order)(element);
}


module.exports = R.curry(parseComponentsObject);
