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
const parseMap = require('../parseMap');
const pipeParseResult = require('../../pipeParseResult');
const parseServerVariableObject = require('./parseServerVariableObject');

const name = 'Server Object';
const requiredKeys = ['url'];

const validateVariableInURL = (context, object) => {
  const url = object.getValue('url');
  const variables = object.get('variables');
  const parseResult = new context.namespace.elements.ParseResult();

  const variablesKeys = variables.content.map(variable => variable.key.toValue());
  const urlVariables = url
    .match(/{(.*?)}/g)
    .map(x => x.replace(/[{}]/g, ''));

  // if you define a variable that is not in URL it warns (and the variable is discarded).
  variablesKeys.forEach((key) => {
    if (urlVariables.indexOf(key) === -1) {
      parseResult.push(createWarning(context.namespace,
        `Server variable '${key}' is not present in the URL and will be discarted`, variables));

      variables.remove(key);
    }
  });

  // if you place a variable in the URL and its not in variables you get a warning that the variable is missing.
  urlVariables.forEach((key) => {
    if (!variables.hasKey(key)) {
      parseResult.push(createWarning(context.namespace,
        `URL variable '${key}' is missing within the server variables`, variables));
    }
  });

  parseResult.push(object);
  return parseResult;
};

const parseMember = context => R.cond([
  [hasKey('description'), parseString(context, name, false)],
  [hasKey('url'), parseString(context, name, true)],
  [hasKey('variables'), parseMap(context, name, 'variables', parseServerVariableObject)],
  [isExtension, () => new context.namespace.elements.ParseResult()],
  [R.T, createInvalidMemberWarning(context.namespace, name)],
]);

const hasVariables = object => object.hasKey('variables');

/**
 * Parse the OpenAPI 'Server Object' (`#/server`)
 * @see http://spec.openapis.org/oas/v3.0.3#server-object
 * @returns ParseResult<Resource>
 * @private
 */
const parseServerObject = context => pipeParseResult(context.namespace,
  R.unless(isObject, createWarning(context.namespace, `'${name}' is not an object`)),
  parseObject(context, name, parseMember(context), requiredKeys, [], true),
  R.when(hasVariables, R.curry(validateVariableInURL)(context)),
  (object) => {
    const resource = new context.namespace.elements.Resource();

    resource.classes.push('host');

    if (object.hasKey('description')) {
      resource.description = object.get('description');
    }

    resource.href = object.get('url');

    if (object.hasKey('variables')) {
      resource.hrefVariables = new context.namespace.elements.HrefVariables(object.get('variables'));
    }

    return resource;
  });

module.exports = parseServerObject;
