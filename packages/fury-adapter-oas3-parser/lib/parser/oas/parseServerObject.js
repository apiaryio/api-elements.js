const R = require('ramda');
const { createWarning } = require('../../elements');
const {
  createInvalidMemberWarning, createUnsupportedMemberWarning,
} = require('../annotations');
const {
  isObject, hasKey, isExtension,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Server Object';
const requiredKeys = ['url'];

const parseMember = context => R.cond([
  [hasKey('description'), parseString(context, name, false)],
  [hasKey('url'), parseString(context, name, true)],
  // [hasKey('variables'), R.compose(parseServerVariablesObject(context), getValue)], // NOT SUPPORTED YET
  [hasKey('variables'), createUnsupportedMemberWarning(context.namespace, name)],
  [isExtension, () => new context.namespace.elements.ParseResult()],
  [R.T, createInvalidMemberWarning(context.namespace, name)],
]);

/**
 * Parse the OpenAPI 'Server Object' (`#/server`)
 * @see http://spec.openapis.org/oas/v3.0.3#server-object
 * @returns ParseResult<Link>
 * @private
 */
const parseServerObject = context => pipeParseResult(context.namespace,
  R.unless(isObject, createWarning(context.namespace, `'${name}' is not an object`)),
  parseObject(context, name, parseMember(context), requiredKeys, [], true),
  (object) => {
    const resource = new context.namespace.elements.Resource();

    resource.classes.push('host');

    if (object.hasKey('description')) {
      const description = object.getValue('description');
      resource.description = description;
    }

    resource.href = object.getValue('url');

    return resource;
  });

module.exports = parseServerObject;
