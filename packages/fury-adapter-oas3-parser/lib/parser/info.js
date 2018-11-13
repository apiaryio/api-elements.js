const R = require('ramda');
const { createError } = require('../elements');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  createMemberValueNotStringError,
  createMemberValueNotStringWarning,
  validateObjectContainsRequiredKeys,
  validateMembers,
} = require('./annotations');
const { isString, isObject } = require('../predicates');
const { pipeParseResult } = require('../fp');

const name = 'Info Object';
const requiredKeys = ['title', 'version'];
const unsupportedKeys = ['termsOfService', 'contact', 'license'];

const hasKey = R.curry((key, member) => member.key.toValue() === key);
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const cloneValue = member => member.value.clone();
const isExtension = member => member.key.toValue().startsWith('x-');

/**
 * Parse the OpenAPI 'Info Object'
 * @returns ParseResult<Category>
 */
function parseInfo(minim, info) {
  const getValue = R.curry((transform, member) => transform(member.value));
  const createCopy = element => {
    const copy = new minim.elements.Copy(element.content);
    // FIXME no tests for sourcemap copy
    copy.attributes.set('sourceMap', element.attributes.get('sourceMap'));
    return copy;
  }

  const parseMember = R.cond([
    [hasKey('title'), R.unless(getValue(isString), createMemberValueNotStringError(minim, name))],
    [hasKey('version'), R.unless(getValue(isString), createMemberValueNotStringError(minim, name))],
    [hasKey('description'), R.ifElse(getValue(isString), getValue(createCopy), createMemberValueNotStringWarning(minim, name))],
    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseInfo = pipeParseResult(minim,
    R.unless(isObject, createError(minim, `'${name}' is not an object`)),
    validateObjectContainsRequiredKeys(minim, name, requiredKeys),
    validateMembers(minim, parseMember),
    (info) => {
      const api = new minim.elements.Category();
      api.classes = ['api'];
      api.title = info.get('title');
      api.attributes.set('version', info.get('version'));

      if (info.get('description')) {
        api.push(info.get('description'));
      }

      return api;
    }
  );

  return parseInfo(info);
}

module.exports = R.curry(parseInfo);
