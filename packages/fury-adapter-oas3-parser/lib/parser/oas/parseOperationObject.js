const R = require('ramda');
const { isExtension, hasKey, getValue } = require('../../predicates');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  validateObjectContainsRequiredKeys,
  createIdentifierNotUniqueWarning,
} = require('../annotations');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseResponsesObject = require('./parseResponsesObject');
const parseParameterObjects = require('./parseParameterObjects');

const name = 'Operation Object';
const requiredKeys = ['responses'];
const unsupportedKeys = [
  'tags', 'externalDocs', 'requestBody', 'callbacks', 'deprecated', 'security',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

function createTransactions(namespace, member, operation) {
  const responses = operation.get('responses');

  return responses.map((response) => {
    const request = new namespace.elements.HttpRequest();
    const method = member.key.clone();
    method.content = method.content.toUpperCase();
    request.method = method;

    return new namespace.elements.HttpTransaction([request, response]);
  });
}

function hrefVariablesFromParameters(namespace, parameters) {
  const path = parameters.get('path')
    ? parameters.get('path')
    : new namespace.elements.HrefVariables();

  const query = parameters.get('query')
    ? parameters.get('query')
    : new namespace.elements.HrefVariables();

  if (!path.isEmpty || !query.isEmpty) {
    return path.concat(query);
  }

  return undefined;
}

function hrefFromParameters(path, queryParameters) {
  const href = path.clone();
  const queryString = queryParameters.keys().join(',');
  href.content += `{?${queryString}}`;
  return href;
}

/**
 * Parse Operation Object
 *
 * @param namespace {Namespace}
 * @param path {StringElement}
 * @param element {Element}
 * @returns ParseResult<Transition>
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject
 */
function parseOperationObject(context, path, member) {
  const { namespace } = context;

  const isUnique = element => context.registerId(element.toValue());

  const parseOperationId = R.curry(member => new namespace.elements.ParseResult([
    R.unless(
      R.compose(isUnique, getValue),
      createIdentifierNotUniqueWarning(namespace, name),
      member
    ),
  ]));

  const parseMember = R.cond([
    [hasKey('summary'), parseString(context, name, false)],
    [hasKey('description'), parseCopy(context, name, false)],
    [hasKey('operationId'), pipeParseResult(namespace, parseString(context, name, false), parseOperationId)],
    [hasKey('responses'), R.compose(parseResponsesObject(context), getValue)],
    [hasKey('parameters'), R.compose(parseParameterObjects(context, name), getValue)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOperation = pipeParseResult(namespace,
    validateObjectContainsRequiredKeys(namespace, name, requiredKeys),
    parseObject(context, name, parseMember),
    (operation) => {
      const transition = new namespace.elements.Transition();
      transition.title = operation.get('summary');

      const operationId = operation.get('operationId');
      if (operationId) {
        transition.id = operationId;
      }

      const description = operation.get('description');
      if (description) {
        transition.push(description);
      }

      const parameters = operation.get('parameters');
      if (parameters) {
        const queryParameters = parameters.get('query');
        if (queryParameters) {
          transition.href = hrefFromParameters(path, queryParameters);
        }

        transition.hrefVariables = hrefVariablesFromParameters(namespace, parameters);
      }

      const transactions = createTransactions(namespace, member, operation);
      transition.content = transition.content.concat(transactions);

      return transition;
    });

  return parseOperation(member.value);
}

module.exports = R.curry(parseOperationObject);
