const R = require('ramda');
const { createWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const { isObject } = require('../../predicates');

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
  const parseComponents = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    () => {
      const unsupportedAnnotation = createWarning(minim, `'${name}' is unsupported`, element);
      return new minim.elements.ParseResult([unsupportedAnnotation]);
    });

  return parseComponents(element);
}


module.exports = R.curry(parseComponentsObject);
