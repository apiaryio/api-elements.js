const R = require('ramda');
const { isExtension, hasKey, getValue } = require('../../predicates');
const {
  createError,
  createInvalidMemberWarning,
  createUnsupportedMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseCopy = require('../parseCopy');
const parseParameterObjects = require('./parseParameterObjects');
const parseServersArray = require('./parseServersArray');
const parseOperationObject = require('./parseOperationObject');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Path Item Object';
const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const unsupportedKeys = ['$ref'];

const isHttpMethodKey = R.anyPass(R.map(hasKey, httpMethods));
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Extract the path variables from a path
 * For example `/{resource}` would return `['resource']`
 * @param path {string}
 * @return array
 * @private
 */
function extractPathVariables(path) {
  const matches = path.match(/({.*?})/gm);

  if (matches) {
    return matches.map(x => x.substring(1, x.length - 1));
  }

  return [];
}

function createErrorForMissingPathVariable(namespace, path, variable) {
  return createError(namespace, `Path '${path.toValue()}' is missing path variable '${variable}'. Add '{${variable}}' to the path`, path);
}

/**
 * Validates that each href variable is found within the given path
 * @param namespace
 * @param path {StringElement}
 * @param hrefVariables {HrefVariables}
 * @retuns ParseResult<HrefVariables>
 * @private
 */
const validateHrefVariablesInPath = R.curry((namespace, path, hrefVariables) => {
  const pathVariables = extractPathVariables(path.toValue());
  const variables = hrefVariables.content.map(member => member.key.toValue());
  const missingPathVariables = variables.filter(name => !pathVariables.includes(name));

  if (missingPathVariables.length > 0) {
    const toError = R.curry(createErrorForMissingPathVariable)(namespace, path);
    const errors = missingPathVariables.map(toError);
    return new namespace.elements.ParseResult(errors);
  }

  return new namespace.elements.ParseResult([hrefVariables]);
});

/**
 * Parse parameters member
 * @param namespace
 * @param path {StringElement}
 * @param member {MemberElement} parameters member from an object element
 * @private
 */
function parseParameters(context, path, member) {
  const { namespace } = context;

  const parseParameter = R.cond([
    [hasKey('path'), R.compose(validateHrefVariablesInPath(namespace, path), getValue)],
    [hasKey('query'), member => member],
    [hasKey('header'), member => member],
  ]);

  const parseParameters = pipeParseResult(namespace,
    parseParameterObjects(context, name),
    parseObject(context, name, parseParameter));

  return parseParameters(member.value);
}

function hrefVariablesFromParameters(namespace, parameters) {
  if (parameters) {
    const path = parameters.get('path')
      ? parameters.get('path')
      : new namespace.elements.HrefVariables();

    const query = parameters.get('query')
      ? parameters.get('query')
      : new namespace.elements.HrefVariables();

    if (!path.isEmpty || !query.isEmpty) {
      return path.concat(query);
    }
  }

  return undefined;
}

function hrefFromParameters(path, parameters) {
  const href = path.clone();

  if (parameters && parameters.get('query')) {
    const queryString = parameters.get('query')
      .map((value, key, member) => {
        if (member.explode) {
          return `${key.toValue()}*`;
        }

        return key.toValue();
      })
      .join(',');
    href.content += `{?${queryString}}`;
  }

  return href;
}

/**
 * Parse Path Item Object
 * @returns Resource
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object
 * @private
 */
function parsePathItemObject(context, member) {
  const { namespace } = context;

  const parseMember = R.cond([
    [hasKey('summary'), parseString(context, name, false)],
    [hasKey('description'), parseCopy(context, name, false)],
    [hasKey('parameters'), R.curry(parseParameters)(context, member.key)],
    [hasKey('servers'), R.compose(parseServersArray(context, name), getValue)],
    [isHttpMethodKey, parseOperationObject(context, member.key)],

    // FIXME Parse $ref

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parsePathItem = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (pathItem) => {
      const resource = new namespace.elements.Resource();

      const parameters = pathItem.get('parameters');
      resource.href = hrefFromParameters(member.key, parameters);
      resource.hrefVariables = hrefVariablesFromParameters(namespace, parameters);

      resource.hosts = pathItem.get('servers');

      const summary = pathItem.get('summary');
      if (summary) {
        resource.title = summary.clone();
      }

      const description = pathItem.get('description');
      if (description) {
        resource.push(description);
      }

      const methods = pathItem.content
        .filter(isHttpMethodKey)
        .map(getValue);
      resource.content = resource.content.concat(methods);

      if (parameters && parameters.get('header')) {
        const headerParameters = parameters.get('header');

        const transactions = R.chain(method => method.transactions.elements, methods);
        const requests = R.map(transaction => transaction.request, transactions);

        requests.forEach((request) => {
          const headers = R.or(request.headers, new namespace.elements.HttpHeaders());

          headers.content = headers.content.concat(
            R.reject(member => !headers.include(member.key.toValue()).isEmpty, headerParameters.content)
          );

          request.headers = headers.clone();
        });
      }

      return resource;
    });

  return parsePathItem(member.value);
}

module.exports = R.curry(parsePathItemObject);
