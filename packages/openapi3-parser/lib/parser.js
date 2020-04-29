const R = require('ramda');
const parseYAML = require('./parser/parseYAML');

const { isAnnotation, isObject } = require('./predicates');
const { createError } = require('./elements');
const pipeParseResult = require('./pipeParseResult');

const parseOpenAPIObject = require('./parser/oas/parseOpenAPIObject');

const isObjectOrAnnotation = R.either(isObject, isAnnotation);

function parse(source, context) {
  const document = parseYAML(source, context);

  const parseDocument = pipeParseResult(context.namespace,
    R.unless(isObjectOrAnnotation, createError(context.namespace, 'Source document is not an object')),
    R.unless(isAnnotation, parseOpenAPIObject(context)));

  return R.chain(parseDocument, document);
}

module.exports = parse;
