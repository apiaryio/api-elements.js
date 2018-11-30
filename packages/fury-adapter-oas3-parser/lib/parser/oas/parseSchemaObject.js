const R = require('ramda');
const { createWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const { isObject } = require('../../predicates');

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
  const parseSchema = pipeParseResult(minim,
    R.unless(isObject, createWarning(minim, `'${name}' is not an object`)),
    (object) => {
      const unsupportedAnnotation = createWarning(minim, `'${name}' is unsupported`, object);
      return new minim.elements.ParseResult([unsupportedAnnotation]);
    });

  return parseSchema(member.value);
}

module.exports = R.curry(parseSchemaObject);
