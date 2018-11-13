const R = require('ramda');
const { createError } = require('../elements');
const { isString } = require('../predicates');

// Parse the OpenAPI Version member
function parseOpenAPI(minim, openapi) {
  if (!isString(openapi.value)) {
    return new minim.elements.ParseResult([createError(minim, 'OpenAPI version is not a string', openapi.value)]);
  }

  if (openapi.value.toValue() !== '3.0.0') {
    return new minim.elements.ParseResult([createError(minim, `Unsupported OpenAPI version '${openapi.value.toValue()}'`, openapi.value)]);
  }

  return new minim.elements.ParseResult([]);
}

module.exports = R.curry(parseOpenAPI);
