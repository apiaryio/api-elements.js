const R = require('ramda');

const { isAnnotation, isObject, isMember } = require('../predicates');
const { createError, createWarning } = require('../elements');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  validateObjectContainsRequiredKeys,
  validateMembers
} = require('./annotations');
const { pipeParseResult } = require('../fp');
const parseOpenAPI = require('./openapi');
const parseInfo = require('./info');

const name = 'OpenAPI Object';
const requiredKeys = ['openapi', 'info', 'paths'];
const unsupportedKeys = ['components', 'servers', 'security', 'tags', 'externalDocs'];

const hasKey = R.curry((key, member) => member.key.toValue() === key);
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const isExtension = member => member.key.toValue().startsWith('x-');
const getValue = member => member.value;

function parseOASObject(minim, object) {
  const parseMember = R.cond([
    [hasKey('openapi'), parseOpenAPI(minim)],
    [hasKey('info'), R.compose(parseInfo(minim), getValue)],

    // FIXME Ignoring `path` keys
    [hasKey('paths'), () => new minim.elements.ParseResult()],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new minim.elements.ParseResult()],

    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseOASObject = pipeParseResult(minim,
    validateObjectContainsRequiredKeys(minim, name, requiredKeys),
    validateMembers(minim, parseMember),
    object => object.get('info')
  );

  return parseOASObject(object);
}

module.exports = R.curry(parseOASObject);
