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
 * @param minim {Namespace}
 * @param element {Element}
 * @returns ParseResult<Transition>
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject
 */
function parseOperationObject(minim, member) {
  const parseMember = R.cond([
    [hasKey('summary'), parseString(minim, name, false)],
    [hasKey('description'), parseCopy(minim, name, false)],

    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => []],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parseOperation = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    parseObject(minim, parseMember),
    (operation) => {
      // FIXME create transactions for operation
      const request = new minim.elements.HttpRequest();
      const method = member.key.clone();
      method.content = method.content.toUpperCase();
      request.method = method;

      const response = new minim.elements.HttpResponse();
      const transaction = new minim.elements.HttpTransaction([request, response]);

      const transition = new minim.elements.Transition();
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
