const R = require('ramda');

const {
  isAnnotation, isExtension, hasKey, getValue,
} = require('../../predicates');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  validateObjectContainsRequiredKeys,
  validateMembers,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseOpenAPI = require('../openapi');
const parseInfoObject = require('./parseInfoObject');
const parsePathsObject = require('./parsePathsObject');

const name = 'OpenAPI Object';
const requiredKeys = ['openapi', 'info', 'paths'];
const unsupportedKeys = ['components', 'servers', 'security', 'tags', 'externalDocs'];

/**
 * Returns whether the given member element is unsupported
 * @param member {MemberElement}
 * @returns {boolean}
 * @see unsupportedKeys
 */
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

function parseOASObject(minim, object) {
  // Takes a parse result, and wraps all of the non annotations inside an array
  const asArray = (parseResult) => {
    const array = new minim.elements.Array(R.reject(isAnnotation, parseResult));
    return new minim.elements.ParseResult([array].concat(parseResult.annotations.elements));
  };

  const parseMember = R.cond([
    [hasKey('openapi'), parseOpenAPI(minim)],
    [hasKey('info'), R.compose(parseInfoObject(minim), getValue)],
    [hasKey('paths'), R.compose(asArray, parsePathsObject(minim), getValue)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new minim.elements.ParseResult()],

    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseOASObject = pipeParseResult(minim,
    validateObjectContainsRequiredKeys(minim, name, requiredKeys),
    validateMembers(minim, parseMember),
    (object) => {
      const api = object.get('info');

      const resources = object.get('paths');
      if (resources) {
        api.content = api.content.concat(resources.content);
      }

      return api;
    });

  return parseOASObject(object);
}

module.exports = R.curry(parseOASObject);
