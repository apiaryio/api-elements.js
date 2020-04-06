const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const parseArray = require('../parseArray');
const parseServerVariableObject = require('./parseServerVariableObject');

const name = 'Server Variables Array';

/**
 * Parse Server Variable Array
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @private
 */
const parseServerVariablesArray = (context, element) => {
  const { namespace } = context;

  const parseServerVariables = pipeParseResult(namespace,
    parseArray(context, name, R.curry(parseServerVariableObject)(context)),
    array => new namespace.elements.HrefVariables(array.content));

  return parseServerVariables(element);
};

module.exports = R.curry(parseServerVariablesArray);
