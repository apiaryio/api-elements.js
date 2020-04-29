const R = require('ramda');
const {
  isMember, isExtension, hasKey, getValue,
} = require('../../predicates');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
  createIdentifierNotUniqueWarning,
} = require('../annotations');
const parseCopy = require('../parseCopy');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseResponsesObject = require('./parseResponsesObject');
const parseParameterObjects = require('./parseParameterObjects');
const parseServersArray = require('./parseServersArray');
const parseRequestBodyObject = require('./parseRequestBodyObject');
const parseSecurityRequirementsArray = require('./parseSecurityRequirementsArray');
const parseReference = require('../parseReference');

const parseRequestBodyObjectOrRef = parseReference('requestBodies', parseRequestBodyObject);

const name = 'Operation Object';
const requiredKeys = ['responses'];
const unsupportedKeys = [
  'tags', 'externalDocs', 'callbacks', 'deprecated',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

const isRequestBody = R.allPass([isMember, hasKey('requestBody')]);

function createTransactions(namespace, member, operation) {
  const requests = R.map(getValue, R.filter(isRequestBody, operation.content));
  const responses = operation.get('responses');

  if (requests.length === 0) {
    requests.push(new namespace.elements.HttpRequest());
  }

  const transactions = [];

  requests.forEach((request) => {
    responses.forEach((response) => {
      const method = member.key.clone();
      method.content = method.content.toUpperCase();

      const clonedRequest = request.clone();
      clonedRequest.method = method;

      transactions.push(new namespace.elements.HttpTransaction([
        clonedRequest,
        response.clone(),
      ]));
    });
  });

  return transactions;
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
  const keys = queryParameters.map((value, key, member) => {
    if (member.explode) {
      return `${key.toValue()}*`;
    }

    return key.toValue();
  });
  const queryString = keys.join(',');
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
 * @private
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
    [hasKey('requestBody'), R.compose(parseRequestBodyObjectOrRef(context), getValue)],
    [hasKey('parameters'), R.compose(parseParameterObjects(context, name), getValue)],
    [hasKey('servers'), R.compose(parseServersArray(context, name), getValue)],
    [hasKey('security'), R.compose(parseSecurityRequirementsArray(context), getValue)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOperation = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys),
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

      const parameters = operation.get('parameters');
      if (parameters) {
        const queryParameters = parameters.get('query');
        if (queryParameters) {
          transition.href = hrefFromParameters(path, queryParameters);
        }

        transition.hrefVariables = hrefVariablesFromParameters(namespace, parameters);

        const headerParameters = parameters.get('header');
        if (headerParameters) {
          transactions.map(transaction => transaction.request).forEach((request) => {
            const headers = R.or(request.headers, new namespace.elements.HttpHeaders());

            headers.content = headers.content.concat(
              R.reject(member => !headers.include(member.key.toValue()).isEmpty, headerParameters.content)
            );

            request.headers = headers.clone();
          });
        }
      }

      transition.hosts = operation.get('servers');

      const security = operation.get('security');
      if (security) {
        transactions.forEach((transaction) => {
          transaction.attributes.set('authSchemes', security.clone());
        });
      }

      return transition;
    });

  return parseOperation(member.value);
}

module.exports = R.curry(parseOperationObject);
