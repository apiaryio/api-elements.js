const R = require('ramda');
const { createError } = require('../../elements');
const {
  createInvalidMemberWarning,
} = require('../annotations');
const {
  isObject, hasKey, getValue, isExtension,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');
const parseLicenseObject = require('./parseLicenseObject');
const parseContactObject = require('./parseContactObject');

const name = 'Info Object';
const requiredKeys = ['title', 'version'];

/**
 * Returns whether the given member element is unsupported
 * @param member {MemberElement}
 * @returns {boolean}
 * @see unsupportedKeys
 * @private
 */

/**
 * Parse the OpenAPI 'Info Object' (`#/info`)
 * @see https://github.com/OAI/OpenAPI-Specification/blob/50c152549263cda0f05608d514ba78546b390d0e/versions/3.0.0.md#infoObject
 * @returns ParseResult<Category>
 * @private
 */
function parseInfo(context, info) {
  const { namespace } = context;

  const parseTermsOfService = pipeParseResult(namespace,
    parseString(context, name, false),
    getValue,
    (termsOfService) => {
      const link = new namespace.elements.Link();
      link.relation = 'terms-of-service';
      link.href = termsOfService;

      return link;
    });

  const parseMember = R.cond([
    [hasKey('title'), parseString(context, name, true)],
    [hasKey('termsOfService'), parseTermsOfService],
    [hasKey('version'), parseString(context, name, true)],
    [hasKey('description'), parseCopy(context, name, false)],
    [hasKey('license'), R.compose(parseLicenseObject(context), getValue)],
    [hasKey('contact'), R.compose(parseContactObject(context), getValue)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseInfo = pipeParseResult(namespace,
    R.unless(isObject, createError(namespace, `'${name}' is not an object`)),
    parseObject(context, name, parseMember, requiredKeys),
    (info) => {
      const api = new namespace.elements.Category();
      api.classes = ['api'];
      api.title = info.get('title');
      api.attributes.set('version', info.get('version'));

      if (info.get('termsOfService')) {
        api.links.push(info.get('termsOfService'));
      }

      if (info.get('description')) {
        api.push(info.get('description'));
      }

      if (info.get('license')) {
        api.links.push(info.get('license'));
      }

      if (info.get('contact')) {
        const contactArray = info.get('contact');
        contactArray.forEach(contact => api.links.push(contact));
      }

      return api;
    });

  return parseInfo(info);
}

module.exports = R.curry(parseInfo);
