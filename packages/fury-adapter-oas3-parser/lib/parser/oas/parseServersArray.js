const R = require('ramda');
const pipeParseResult = require('../../pipeParseResult');
const parseArray = require('../parseArray');
const parseServerObject = require('./parseServerObject');

const name = 'Servers Array';

/**
 * Parse Servers Array
 *
 * @param namespace {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @private
 */
function parseServersArray(context, element) {
  const { namespace } = context;

  const parseServers = pipeParseResult(namespace,
    parseArray(context, name, R.curry(parseServerObject)(context)),
    array => new namespace.elements.Category(
      array.content, { classes: ['hosts'] }
    ));

  return parseServers(element);
}

module.exports = R.curry(parseServersArray);
