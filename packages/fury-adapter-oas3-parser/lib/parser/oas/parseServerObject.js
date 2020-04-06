const R = require('ramda');
const { createWarning } = require('../../elements');
const {
  createInvalidMemberWarning,
} = require('../annotations');
const {
  isObject, hasKey, isExtension, getValue,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const pipeParseResult = require('../../pipeParseResult');
const parseServerVariablesArray = require('./parseServerVariablesArray');

const name = 'Server Object';
const requiredKeys = ['url'];

const parseMember = context => R.cond([
  [hasKey('description'), parseString(context, name, false)],
  [hasKey('url'), parseString(context, name, true)],
  [hasKey('variables'), R.compose(parseServerVariablesArray(context), getValue)],
  [isExtension, () => new context.namespace.elements.ParseResult()],
  [R.T, createInvalidMemberWarning(context.namespace, name)],
]);

/**
 * Parse the OpenAPI 'Server Object' (`#/server`)
 * @see http://spec.openapis.org/oas/v3.0.3#server-object
 * @returns ParseResult<Resource>
 * @private
 */
const parseServerObject = context => pipeParseResult(context.namespace,
  R.unless(isObject, createWarning(context.namespace, `'${name}' is not an object`)),
  parseObject(context, name, parseMember(context), requiredKeys, [], true),
  (object) => {
    const resource = new context.namespace.elements.Resource();

    resource.classes.push('host');

    if (object.hasKey('description')) {
      resource.description = object.get('description');
    }

    resource.href = object.get('url');

    if (object.hasKey('variables')) {
      resource.push(object.get('variables'));
    }

    return resource;
  });

module.exports = parseServerObject;
