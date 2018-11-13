const R = require('ramda');

const { isAnnotation, isObject } = require('../predicates');
const { createError } = require('../elements');

const requiredKeys = ['openapi', 'info', 'paths'];

function parseOASObject(minim, object) {
  // Validate Missing Keys
  const isKeyMissing = key => object.get(key) === undefined;
  const missingRequiredKeys = R.filter(isKeyMissing, requiredKeys);

  if (missingRequiredKeys.length > 0) {
    const errorFromKey = (key) => {
      return createError(minim, `OpenAPI Object is missing required property '${key}'`, object);
    };

    return new minim.elements.ParseResult(
      R.map(errorFromKey, missingRequiredKeys)
    );
  }

  // FIXME: Returning error that OAS is unsupported
  return new minim.elements.ParseResult([
    createError(minim, 'OpenAPI 3 is unsupported', object)
  ]);
}

module.exports = R.curry(parseOASObject);
