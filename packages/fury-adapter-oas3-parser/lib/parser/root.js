const R = require('ramda');

const { isAnnotation, isObject } = require('../predicates');
const { createError } = require('../elements');
const parseOpenAPI = require('./openapi');

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

  // Parse object members

  const hasKey = R.curry((key, member) => member.key.toValue() === key);
  const parseMember = R.cond([
    [hasKey('openapi'), parseOpenAPI(minim)],
    // FIXME `info` unhandled
    // FIXME `path` unhandled
    [R.T, () => new minim.elements.ParseResult()],
  ]);

  return R.chain(
    parseMember,
    new minim.elements.ParseResult(object.content)
  );
}

module.exports = R.curry(parseOASObject);
