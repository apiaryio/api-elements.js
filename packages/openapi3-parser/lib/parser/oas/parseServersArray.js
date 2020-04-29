const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const parseArray = require('../parseArray');
const parseServerObject = require('./parseServerObject');

/**
 * Parse Servers Array
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @private
 */
function parseServersArray(context, name, element) {
  const { namespace } = context;

  const parseServers = pipeParseResult(namespace,
    parseArray(context, `${name}' 'servers`, R.curry(parseServerObject)(context)),
    array => new namespace.elements.Category(
      array.content, { classes: ['hosts'] }
    ));

  return parseServers(element);
}

module.exports = R.curry(parseServersArray);
