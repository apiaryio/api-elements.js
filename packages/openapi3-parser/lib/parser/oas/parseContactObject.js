const R = require('ramda');
const {
  createInvalidMemberWarning,
} = require('../annotations');
const {
  hasKey, isExtension,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Contact Object';

const parseMember = context => R.cond([
  [hasKey('name'), parseString(context, name, false)],
  [hasKey('url'), parseString(context, name, false)],
  [hasKey('email'), parseString(context, name, false)],
  [isExtension, () => new context.namespace.elements.ParseResult()],
  [R.T, createInvalidMemberWarning(context.namespace, name)],
]);

/**
 * Parse the OpenAPI 'Contact Object' (`#/info/contact`)
 * @see http://spec.openapis.org/oas/v3.0.2#contact-object
 * @returns ParseResult<Link>
 * @private
 */
const parseContactObject = context => pipeParseResult(
  context.namespace,
  parseObject(context, name, parseMember(context)),
  (contactObject) => {
    const contactName = contactObject.get('name');
    const contactUrl = contactObject.get('url');
    const contactEmail = contactObject.get('email');
    const links = [];

    if (contactUrl) {
      const link = new context.namespace.elements.Link();
      link.relation = 'contact';
      link.href = contactUrl;

      if (contactName) {
        link.title = contactName.clone();
      }

      links.push(link);
    }

    if (contactEmail) {
      const link = new context.namespace.elements.Link();
      link.relation = 'contact';
      link.href = `mailto:${contactEmail.toValue()}`;

      if (!contactUrl && contactName) {
        link.title = contactName.clone();
      }

      links.push(link);
    }

    return links;
  }
);

module.exports = parseContactObject;
