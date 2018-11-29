const R = require('ramda');
const { createWarning } = require('../annotations');

const name = 'Components Object';

/**
 * Parse Components Object
 *
 * @param minim {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#componentsObject
 */
function parseComponentsObject(minim, element) {
  const unsupportedAnnotation = createWarning(minim, `'${name}' is unsupported`, element);
  return new minim.elements.ParseResult([unsupportedAnnotation]);
}


module.exports = R.curry(parseComponentsObject);
