const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const {
  isString, isExtension, hasKey, getKey, getValue,
} = require('../../predicates');
const { createWarning, createInvalidMemberWarning } = require('../annotations');
const parseObject = require('../parseObject');
const parseResponseObject = require('./parseResponseObject');
const parseReference = require('../parseReference');

const parseResponseObjectOrRef = parseReference('responses', parseResponseObject);

const name = 'Responses Object';

// Returns if member has key that is 3 digit HTTP status code
function isStatusCode(member) {
  return String(member.key.toValue()).match(/^\d\d\d$/);
}

// Returns if member has key that is 3 digit HTTP status code with X to represent range
function isStatusCodeRange(member) {
  return String(member.key.toValue()).match(/^[\dX]{3}$/);
}

const isResponseField = R.anyPass([isStatusCode, isStatusCodeRange, hasKey('default')]);
const isKeyString = R.compose(isString, getKey);

/**
 * Parse Responses Object
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#responsesObject
 * @private
 */
function parseResponsesObject(context, element) {
  const { namespace } = context;

  const createUnsupportedStatusCodeWarning = (member) => {
    const message = `'${name}' response status code ranges are unsupported`;
    return createWarning(namespace, message, member.key);
  };

  const attachStatusCodeNotStringWarning = member => new namespace.elements.ParseResult([
    member,
    createWarning(namespace, `'${name}' response status code must be a string and should be wrapped in quotes`, member.key),
  ]);

  const isStatusCodeOrDefault = R.anyPass([isStatusCode, hasKey('default')]);

  // FIXME Add support for status code ranges
  // https://github.com/apiaryio/fury-adapter-oas3-parser/issues/64
  const validateStatusCode = pipeParseResult(namespace,
    R.unless(isStatusCodeOrDefault, createUnsupportedStatusCodeWarning),
    R.unless(isKeyString, attachStatusCodeNotStringWarning));

  const parseResponse = pipeParseResult(namespace,
    validateStatusCode,
    R.compose(parseResponseObjectOrRef(context), getValue));

  const parseMember = R.cond([
    [isResponseField, parseResponse],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseResponses = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    object => object.content.map((member) => {
      const response = member.value;

      if (isStatusCode(member)) {
        response.statusCode = String(member.key.toValue());
      }

      return response;
    }));

  return parseResponses(element);
}

module.exports = R.curry(parseResponsesObject);
