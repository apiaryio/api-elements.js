const R = require('ramda');
const { createWarning } = require('../annotations');

const name = 'Schema Object';

/**
 * Parse Schema Object
 *
 * @param minim {Namespace}
 * @param element {MemberElement}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schemaObject
 */
function parseSchemaObject(minim, member) {
  const unsupportedAnnotation = createWarning(minim, `'${name}' is unsupported`, member);
  return new minim.elements.ParseResult([unsupportedAnnotation]);
}

module.exports = R.curry(parseSchemaObject);
