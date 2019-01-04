const R = require('ramda');
const {
  isObject, isExtension, hasKey, getValue,
} = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  validateObjectContainsRequiredKeys,
} = require('../annotations');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseResponsesObject = require('./parseResponsesObject');

const name = 'Operation Object';
const requiredKeys = ['responses'];
const unsupportedKeys = [
  'tags', 'externalDocs', 'parameters', 'requestBody',
  'callbacks', 'deprecated', 'security',
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

/**
 * Parse Operation Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult<Transition>
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject
 */
function parseOperationObject(namespace, member) {
  const parseMember = R.cond([
    [hasKey('summary'), parseString(namespace, name, false)],
    [hasKey('description'), parseCopy(namespace, name, false)],
    [hasKey('operationId'), parseString(namespace, name, false)],
    [hasKey('responses'), R.compose(parseResponsesObject(namespace), getValue)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOperation = pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    validateObjectContainsRequiredKeys(namespace, name, requiredKeys),
    parseObject(namespace, parseMember),
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

      const transactions = createTransactions(namespace, member, operation);
      transition.content = transition.content.concat(transactions);

      return transition;
    });

  return parseOperation(member.value);
}

module.exports = R.curry(parseOperationObject);
