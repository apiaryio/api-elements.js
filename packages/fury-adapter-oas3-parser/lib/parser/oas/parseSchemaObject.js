const R = require('ramda');
const { createWarning } = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const { isObject } = require('../../predicates');

const name = 'Schema Object';

/**
 * Parse Schema Object
 *
 * @param namespace {Namespace}
 * @param element {MemberElement}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schemaObject
 */
function parseSchemaObject(context, member) {
  const { namespace } = context;

  const parseSchema = pipeParseResult(namespace,
    R.unless(isObject, createWarning(namespace, `'${name}' is not an object`)),
    (object) => {
      // FIXME: Return a dataStructure to represent the given schema
      let element;

      const type = object.getValue('type');
      if (type === 'object') {
        element = new namespace.elements.Object();
      } else if (type === 'array') {
        element = new namespace.elements.Array();
      } else if (type === 'string') {
        element = new namespace.elements.String();
      } else {
        // FIXME: Unsupported type handling
        // Assuming unknown or missing type is object
        element = new namespace.elements.Object();
      }

      element.id = member.key.clone();

      return new namespace.elements.DataStructure(element);
    });

  return parseSchema(member.value);
}

module.exports = R.curry(parseSchemaObject);
