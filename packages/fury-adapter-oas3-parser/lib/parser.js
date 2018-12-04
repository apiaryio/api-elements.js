const R = require('ramda');
const parseYAML = require('./parser/parseYAML');

const { isAnnotation, isObject } = require('./predicates');
const { createError } = require('./elements');
const pipeParseResult = require('./pipeParseResult');

const parseOpenAPIObject = require('./parser/oas/parseOpenAPIObject');

const isObjectOrAnnotation = R.either(isObject, isAnnotation);

function parse(source, minim) {
  const document = parseYAML(source, minim);

  const parseDocument = pipeParseResult(minim,
    R.unless(isObjectOrAnnotation, createError(minim, 'Source document is not an object')),
    R.unless(isAnnotation, parseOpenAPIObject(minim)));

  return R.chain(parseDocument, document);
}

module.exports = parse;
