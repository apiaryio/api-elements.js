const R = require('ramda');
const {
  createError,
  createWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const { isExtension, hasKey } = require('../../predicates');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');

const name = 'Reference Object';
const requiredKeys = ['$ref'];

/**
 * Recursively dereference an element in the given component
 *
 * @param namespace {Namespace}
 * @param component {ObjectElement}
 * @param ref {StringElement}
 * @param element {Element}
 * @param parents {string[]} an optional collections of traversed parents
 *
 * @returns Element
 */
function dereference(namespace, component, ref, element, parents = []) {
  if (parents && parents.includes(element.element)) {
    // We've already cycled through this element. We're in a circular loop
    parents.shift();
    return createError(namespace, `Reference cannot be circular, '${ref.toValue()}' causes a circular reference via ${parents.join(', ')}`, ref);
  }

  const match = component.get(element.element);
  if (match) {
    parents.push(element.element);
    return dereference(namespace, component, ref, match, parents);
  }

  return element;
}

/**
 * Parse Reference Object
 *
 * @param namespace {Namespace}
 * @param componentName {string}
 * @param element {Element}
 * @returns ParseResult - A parse result containing error if the referenced
 * object was not found, the referenced element, or if the referenced
 * element was not successfully parsed, an empty parse result.
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#referenceObject
 * @private
 */
function parseReferenceObject(context, componentName, element, returnReferenceElement) {
  const { namespace } = context;
  const { components } = context.state;

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

    if (!components) {
      return createError(namespace, "'#/components' is not defined", ref);
    }

    const component = components.get(referenceParts[2]);
    if (!component) {
      return createError(namespace, `'#/components/${componentName}' is not defined`, ref);
    }

    const componentId = referenceParts[3];
    if (!component.hasKey(componentId)) {
      return createError(namespace, `'${ref.toValue()}' is not defined`, ref);
    }

    if (returnReferenceElement) {
      let Element;

      const referenced = component.get(componentId);
      if (referenced instanceof context.namespace.elements.DataStructure) {
        Element = referenced.content.constructor;
      } else {
        ({ Element } = context.namespace.elements);
      }

      const element = new Element();
      element.element = componentId;
      return element;
    }

    return new namespace.elements.ParseResult(
      component
        .filter((value, key) => key.toValue() === componentId && value)
        .map(value => dereference(namespace, component, ref, value))
    );
  };

  const parseMember = R.cond([
    [hasKey('$ref'), parseString(context, name, true)],
    [isExtension, createWarning(namespace, `Extensions are not permitted in '${name}'`)],
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseReference = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys),
    object => object.get('$ref'),
    parseRef);

  return parseReference(element);
}

module.exports = R.curryN(3, parseReferenceObject);
