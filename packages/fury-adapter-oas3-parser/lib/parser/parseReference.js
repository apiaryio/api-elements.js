const R = require('ramda');
const { isObject } = require('../predicates');
const parseReferenceObject = require('./oas/parseReferenceObject');

function isReferenceObject(element) {
  return isObject(element) && element.get('$ref') !== undefined;
}

function parseReference(component, parser, context, element) {
  if (isReferenceObject(element)) {
    return parseReferenceObject(context, component, element);
  }

  return parser(context, element);
}

module.exports = R.curry(parseReference);
