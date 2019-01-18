const R = require('ramda');
const { isObject, isDataStructure } = require('../predicates');
const parseReferenceObject = require('./oas/parseReferenceObject');

function isReferenceObject(element) {
  return isObject(element) && element.get('$ref') !== undefined;
}

function parseReference(component, parser, context, element) {
  if (isReferenceObject(element)) {
    const result = parseReferenceObject(context, component, element);

    if (component === 'schemas') {
      const convertToReference = R.when(isDataStructure, (structure) => {
        const element = new context.namespace.Element();
        element.element = structure.content.id.toValue();
        return new context.namespace.elements.DataStructure(element);
      });

      return R.map(convertToReference, result);
    }

    return result;
  }

  return parser(context, element);
}

module.exports = R.curry(parseReference);
