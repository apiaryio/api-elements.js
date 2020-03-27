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

const name = 'Hosts Object';
const requiredKeys = ['url'];

const parseMember = context => R.cond([
  [hasKey('description'), parseString(context, name, false)],
  [hasKey('url'), parseString(context, name, false)],
  [hasKey('variables'), parseString(context, name, false)],
  [isExtension, () => new context.namespace.elements.ParseResult()],
  [R.T, createInvalidMemberWarning(context.namespace, name)],
]);

/**
 * Parse the OpenAPI 'Server Object' (`#/server`)
 * @see http://spec.openapis.org/oas/v3.0.3#server-object
 * @returns ParseResult<Link>
 * @private
 */
const parseHostsObject = context => pipeParseResult(context.namespace,
  R.unless(isObject, createWarning(context.namespace, `'${name}' is not an object`)),
  parseObject(context, name, parseMember(context), requiredKeys, [], true),
  (hostsObject) => {
    const hosts = [];

    hostsObject.forEach((hostObject) => {
      const resource = new context.namespace.elements.Resource();

      resource.push({ classes: ['host'] });

      const description = hostObject.get('description');
      if (description) {
        resource.push(description);
      }

      const variables = hostObject.get('variables');
      if (variables) {
        resource.hrefVariables = variables;
      }

      resource.href = hostObject.getValue('url');

      hosts.push(resource);
    });
  });

module.exports = parseHostsObject;
