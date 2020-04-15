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
const parseEnum = require('../parseEnum');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Server Variable Object';
const requiredKeys = ['default'];

const parseMember = context => R.cond([
  [hasKey('enum'), R.compose(parseEnum(context, name), getValue)],
  [hasKey('default'), parseString(context, name, true)],
  [hasKey('description'), parseString(context, name, false)],
  [isExtension, () => new context.namespace.elements.ParseResult()],
  [R.T, createInvalidMemberWarning(context.namespace, name)],
]);

/**
 * Parse the OpenAPI 'Server Variable Object' (`#/server/server-variable`)
 * @see http://spec.openapis.org/oas/v3.0.3#server-variable-object
 * @returns ParseResult<Member>
 * @private
 */
const parseServerVariableObject = (context, element) => pipeParseResult(context.namespace,
  R.unless(isObject, createWarning(context.namespace, `'${name}' is not an object`)),
  parseObject(context, name, parseMember(context), requiredKeys, [], true),
  (object) => {
    const variable = new context.namespace.elements.String();

    variable.default = object.getValue('default');

    if (object.hasKey('description')) {
      variable.description = object.getValue('description');
    }

    if (object.hasKey('enum')) {
      variable.enum = object.get('enum');
    }

    return variable;
  })(element);

module.exports = R.curry(parseServerVariableObject);
