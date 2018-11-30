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
      // FIXME: Return a dataStructure to represent the given schema
      let element;

      const type = object.getValue('type');
      if (type === 'object') {
        element = new minim.elements.Object();
      } else if (type === 'array') {
        element = new minim.elements.Array();
      } else if (type === 'string') {
        element = new minim.elements.String();
      } else {
        // FIXME: Unsupported type handling
        // Assuming unknown or missing type is object
        element = new minim.elements.Object();
      }

      element.id = member.key.clone();

      return new minim.elements.DataStructure(element);
    });

  return parseSchema(member.value);
}

module.exports = R.curry(parseSchemaObject);
