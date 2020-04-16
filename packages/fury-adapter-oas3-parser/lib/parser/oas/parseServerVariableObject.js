const R = require('ramda');
const { createWarning } = require('../../elements');
const {
  createInvalidMemberWarning,
} = require('../annotations');
const {
  isObject, hasKey, isExtension, getValue, isString,
} = require('../../predicates');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseArray = require('../parseArray');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Server Variable Object';
const requiredKeys = ['default'];

const parseEnumStrings = R.curry((context, element) => {
  const { namespace } = context;

  const parseEnumString = R.unless(isString,
    createWarning(namespace, `'${name}' 'enum' array value is not a string`));

  const parseEnum = pipeParseResult(
    namespace,
    parseArray(context, `${name}' 'enum`, parseEnumString),
    (array) => {
      const element = new context.namespace.elements.Enum();
      element.enumerations = array.map((value) => {
        value.attributes.set('typeAttributes', ['fixed']);
        return value;
      });
      return element;
    }
  );

  return parseEnum(element);
});

const parseMember = context => R.cond([
  [hasKey('enum'), R.compose(parseEnumStrings(context), getValue)],
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
    const variable = R.or(object.get('enum'), new context.namespace.elements.String());

    variable.default = object.getValue('default');

    if (object.hasKey('description')) {
      variable.description = object.getValue('description');
    }

    return variable;
  })(element);

module.exports = R.curry(parseServerVariableObject);
