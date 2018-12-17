const R = require('ramda');
const {
  createError,
  createWarning,
  createInvalidMemberWarning,
  validateObjectContainsRequiredKeys,
} = require('../annotations');
const { isObject, isExtension, hasKey } = require('../../predicates');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');

const name = 'Reference Object';
const requiredKeys = ['$ref'];

/**
 * Parse Reference Object
 *
 * @param namespace {Namespace}
 * @param components {ObjectElement}
 * @param componentName {string}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#referenceObject
 */
function parseReferenceObject(namespace, components, componentName, element) {
  const parseRef = (ref) => {
    if (!ref.toValue().startsWith('#/components/')) {
      return createError(namespace, "Only local references to '#/components' within the same file are supported", ref);
    }
    const referenceParts = ref.toValue().split('/');

    if (referenceParts[2] !== componentName) {
      return createError(namespace, `Only references to '${componentName}' are permitted from this location`, ref);
    }

    if (referenceParts.length !== 4) {
      return createError(namespace,
        `Only references to a reusable component inside '#/components/${componentName}' are supported`, ref);
    }

    const component = components.get(referenceParts[2]);
    if (!component) {
      return createError(namespace, `'#/components/${componentName}' is not defined`, ref);
    }

    const element = component.get(referenceParts[3]);
    if (!element) {
      return createError(namespace, `'${ref.toValue()}' is not defined`, ref);
    }

    return element;
  };

  const parseMember = R.cond([
    [hasKey('$ref'), parseString(namespace, name, true)],
    [isExtension, createWarning(namespace, `Extensions are not permitted in '${name}'`)],
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseReference = pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    validateObjectContainsRequiredKeys(namespace, name, requiredKeys),
    parseObject(namespace, parseMember),
    object => object.get('$ref'),
    parseRef);

  return parseReference(element);
}

module.exports = R.curry(parseReferenceObject);
