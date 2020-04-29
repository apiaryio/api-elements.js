
const R = require('ramda');
const { createWarning } = require('../../elements');
const {
  createInvalidMemberWarning,
} = require('../annotations');
const {
  isObject, hasKey, isExtension,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const pipeParseResult = require('../../pipeParseResult');

const name = 'License Object';
const requiredKeys = ['name'];

const parseMember = context => R.cond([
  [hasKey('name'), parseString(context, name, false)],
  [hasKey('url'), parseString(context, name, false)],
  [isExtension, () => new context.namespace.elements.ParseResult()],
  [R.T, createInvalidMemberWarning(context.namespace, name)],
]);

/**
 * Parse the OpenAPI 'License Object' (`#/info/license`)
 * @see http://spec.openapis.org/oas/v3.0.2#license-object
 * @returns ParseResult<Link>
 * @private
 */
const parseLicenseObject = context => pipeParseResult(context.namespace,
  R.unless(isObject, createWarning(context.namespace, `'${name}' is not an object`)),
  parseObject(context, name, parseMember(context), requiredKeys, [], true),
  (object) => {
    const link = new context.namespace.elements.Link();
    link.relation = 'license';
    link.title = object.get('name');
    link.href = object.getValue('url') || 'http://purl.org/atompub/license#unspecified';
    return link;
  });

module.exports = parseLicenseObject;
