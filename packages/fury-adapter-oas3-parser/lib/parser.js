const R = require('ramda');
const parseYAML = require('./parser/parseYAML');

const { isAnnotation, isObject } = require('./predicates');
const { createError } = require('./elements');
const pipeParseResult = require('./pipeParseResult');

const parseOpenAPIObject = require('./parser/oas/parseOpenAPIObject');

const isObjectOrAnnotation = R.either(isObject, isAnnotation);

function parse(source, namespace) {
  const document = parseYAML(source, namespace);

  const parseDocument = pipeParseResult(namespace,
    R.unless(isObjectOrAnnotation, createError(namespace, 'Source document is not an object')),
    R.unless(isAnnotation, parseOpenAPIObject(namespace)));

  return R.chain(parseDocument, document);
}

module.exports = parse;
