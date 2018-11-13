const R = require('ramda');
const parseYAML = require('./parser/yaml');

const { isAnnotation, isObject } = require('./predicates');
const { createError } = require('./elements');

const parseOASObject = require('./parser/root');

const isObjectOrAnnotation = R.either(isObject, isAnnotation);

function parse(source, minim) {
  const document = parseYAML(source, minim);

  const parseDocument = R.pipe(
    R.unless(isObjectOrAnnotation, createError(minim, 'Source document is not an object')),
    R.unless(isAnnotation, parseOASObject(minim)),
  )

  return R.chain(parseDocument, document)
}

module.exports = parse;
