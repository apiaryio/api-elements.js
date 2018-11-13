const R = require('ramda');

const { isAnnotation, isObject } = require('../predicates');
const { createError, createWarning } = require('../elements');
const parseOpenAPI = require('./openapi');

const requiredKeys = ['openapi', 'info', 'paths'];

const createInvalidMemberWarning = R.curry((minim, member) => {
  const message = `OpenAPI Object contains invalid key '${member.key.toValue()}'`;
  return createWarning(minim, message, member.key);
});

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
  const isUnhandledKey = R.anyPass([
    hasKey('info'),
    hasKey('paths'),
  ]);
  const parseMember = R.cond([
    [hasKey('openapi'), parseOpenAPI(minim)],

    // FIXME Ignoring `info` and `path` keys
    [isUnhandledKey, () => new minim.elements.ParseResult()],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(minim)],
  ]);

  return R.chain(
    parseMember,
    new minim.elements.ParseResult(object.content)
  );
}

module.exports = R.curry(parseOASObject);
