const R = require('ramda');
const { createWarning } = require('./annotations');
const pipeParseResult = require('../pipeParseResult');
const { isArray, isNull } = require('../predicates');

/**
 * Type with domain of the union of values typed by Elements in the enumerations attribute.
 * Also called tagged union or Σ-type.
 * @param element {Element}
 * @returns {ParseResult<MemberElement<EnumElement>>}
 * @private
 */
const parseEnum = (context, name) => pipeParseResult(context.namespace,
  R.unless(isArray, createWarning(context.namespace, `'${name}' 'enum' is not an array`)),
  (element) => {
    const enumElement = new context.namespace.elements.Enum();
    enumElement.enumerations = element;
    enumElement.enumerations.forEach(
      R.unless(isNull, value => value.attributes.set('typeAttributes', ['fixed']))
    );
    return enumElement;
  });

module.exports = parseEnum;
