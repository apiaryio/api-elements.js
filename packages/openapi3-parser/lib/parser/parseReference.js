const R = require('ramda');
const { isObject, isAnnotation } = require('../predicates');
const parseReferenceObject = require('./oas/parseReferenceObject');

function isReferenceObject(element) {
  return isObject(element) && element.get('$ref') !== undefined;
}

function parseReference(component, parser, context, element, isInsideSchema, returnReferenceElement) {
  if (isReferenceObject(element)) {
    const parseResult = parseReferenceObject(context, component, element, component === 'schemas' || returnReferenceElement);

    // If we're referencing a schema object and we're not inside a schema
    // parser (subschema), then we want to wrap the object in a data structure element
    if (!isInsideSchema && component === 'schemas') {
      const DataStructure = R.constructN(1, context.namespace.elements.DataStructure);
      const wrapInDataStructure = R.unless(isAnnotation, DataStructure);
      return R.map(wrapInDataStructure, parseResult);
    }

    return parseResult;
  }

  return parser(context, element);
}

module.exports = R.curryN(4, parseReference);
