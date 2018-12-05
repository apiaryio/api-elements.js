const R = require('ramda');
const {
  isObject,
  isExtension,
  hasKey,
  getValue,
} = require('../../predicates');
const {
  createError,
  createWarning,
  createInvalidMemberWarning,
  createUnsupportedMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseString = require('../parseString');
const parseCopy = require('../parseCopy');
const parseParameterObjects = require('./parseParameterObjects');
const parseOperationObject = require('./parseOperationObject');
const pipeParseResult = require('../../pipeParseResult');

const name = 'Path Item Object';
const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const unsupportedKeys = ['$ref', 'description', 'servers'];

const isHttpMethodKey = R.anyPass(R.map(hasKey, httpMethods));
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

/**
 * Extract the path variables from a path
 * For example `/{resource}` would return `['resource']`
 * @param path {string}
 * @return array
 */
function extractPathVariables(path) {
  const matches = path.match(/({.*?})/gm);

  if (matches) {
    return matches.map(x => x.substring(1, x.length - 1));
  }

  return [];
}

function createErrorForMissingPathParameter(minim, path, variable) {
  // FIXME: This shouldn't be an error
  const message = `Path '${path.toValue()}' contains variable '${variable}' which is not declared in the parameters section of the '${name}'`;
  return createError(minim, message, path);
}

function createErrorForMissingPathVariable(minim, path, variable) {
  return createError(minim, `Path '${path.toValue()}' is missing path variable '${variable}'. Add '{${variable}}' to the path`, path);
}

/**
 * Validates that there is a href variable for each path variable in the given path
 * @param minim
 * @param path {StringElement}
 * @param pathItem {ObjectElement}
 * @retuns ParseResult<ObjectElement>
 */
function validatePathForMissingHrefVariables(minim, path, pathItem) {
  const pathVariables = extractPathVariables(path.toValue());

  const parameters = pathItem.get('parameters')
    ? pathItem.get('parameters')
    : new minim.elements.Object();

  const hrefVariables = parameters.get('path')
    ? parameters.get('path')
    : new minim.elements.HrefVariables();

  const missingParameters = hrefVariables
    ? pathVariables.filter(name => !hrefVariables.getMember(name))
    : pathVariables;

  if (missingParameters.length > 0) {
    const toError = R.curry(createErrorForMissingPathParameter)(minim, path);
    return new minim.elements.ParseResult(missingParameters.map(toError));
  }

  return new minim.elements.ParseResult([pathItem]);
}

/**
 * Validates that each href variable is found within the given path
 * @param minim
 * @param path {StringElement}
 * @param hrefVariables {HrefVariables}
 * @retuns ParseResult<HrefVariables>
 */
const validateHrefVariablesInPath = R.curry((minim, path, hrefVariables) => {
  const pathVariables = extractPathVariables(path.toValue());
  const variables = hrefVariables.content.map(member => member.key.toValue());
  const missingPathVariables = variables.filter(name => !pathVariables.includes(name));

  if (missingPathVariables.length > 0) {
    const toError = R.curry(createErrorForMissingPathVariable)(minim, path);
    const errors = missingPathVariables.map(toError);
    return new minim.elements.ParseResult(errors);
  }

  return new minim.elements.ParseResult([hrefVariables]);
});

/**
 * Parse parameters member
 * @param minim
 * @param path {StringElement}
 * @param member {MemberElement} parameters member from an object element
 */
function parseParameters(minim, path, member) {
  const parseParameter = R.cond([
    [hasKey('path'), R.compose(validateHrefVariablesInPath(minim, path), getValue)],
    [hasKey('query'), member => member],
  ]);

  const parseParameters = pipeParseResult(minim,
    parseParameterObjects(minim, name),
    parseObject(minim, parseParameter));

  return parseParameters(member.value);
}

function hrefVariablesFromParameters(minim, parameters) {
  if (parameters) {
    const path = parameters.get('path')
      ? parameters.get('path')
      : new minim.elements.HrefVariables();

    const query = parameters.get('query')
      ? parameters.get('query')
      : new minim.elements.HrefVariables();

    if (!path.isEmpty || !query.isEmpty) {
      return path.concat(query);
    }
  }

  return undefined;
}

function hrefFromParameters(path, parameters) {
  const href = path.clone();

  if (parameters && parameters.get('query')) {
    const queryString = parameters.get('query').keys().join(',');
    href.content += `{?${queryString}}`;
  }

  return href;
}

/**
 * Parse Path Item Object
 * @returns Resource
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object
 */
function parsePathItemObject(minim, member) {
  const parseMember = R.cond([
    [hasKey('summary'), parseString(minim, name, false)],
    [hasKey('description'), parseCopy(minim, name, false)],
    [hasKey('parameters'), R.curry(parseParameters)(minim, member.key)],
    [isHttpMethodKey, parseOperationObject(minim)],

    // FIXME Parse $ref
    // FIXME Parse servers

    [isUnsupportedKey, createUnsupportedMemberWarning(minim, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new minim.elements.ParseResult()],

    // Return a warning for every other key
    [R.T, createInvalidMemberWarning(minim, name)],
  ]);

  const parsePathItem = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    parseObject(minim, parseMember),
    R.curry(validatePathForMissingHrefVariables)(minim, member.key),
    (pathItem) => {
      const resource = new minim.elements.Resource();

      const parameters = pathItem.get('parameters');
      resource.href = hrefFromParameters(member.key, parameters);
      resource.hrefVariables = hrefVariablesFromParameters(minim, parameters);

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

      return resource;
    });

  return parsePathItem(member.value);
}

module.exports = R.curry(parsePathItemObject);
