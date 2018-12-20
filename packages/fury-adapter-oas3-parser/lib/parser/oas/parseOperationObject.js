const R = require('ramda');
const { isObject, isExtension, hasKey } = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');

const name = 'Operation Object';
const unsupportedKeys = [
  'tags', 'externalDocs', 'operationId', 'parameters', 'requestBody',
  'responses', 'callbacks', 'deprecated', 'security',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

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

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOperation = pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    parseObject(namespace, parseMember),
    (operation) => {
      // FIXME create transactions for operation
      const request = new namespace.elements.HttpRequest();
      const method = member.key.clone();
      method.content = method.content.toUpperCase();
      request.method = method;

      const response = new namespace.elements.HttpResponse();
      const transaction = new namespace.elements.HttpTransaction([request, response]);

      const transition = new namespace.elements.Transition();
      transition.title = operation.get('summary');

      const description = operation.get('description');
      if (description) {
        transition.push(description);
      }

      transition.push(transaction);

      return transition;
    });

  return parseOperation(member.value);
}

module.exports = R.curry(parseOperationObject);
