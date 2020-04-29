const R = require('ramda');
const { isAnnotation, getValue } = require('../predicates');
const parseString = require('./parseString');

const createCopy = R.curry((namespace, element) => {
  const copy = new namespace.elements.Copy(element.content);
  copy.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return copy;
});

/**
 * Parse a string from a member into a copy element
 * @pram namespace
 * @pram name {string}
 * @pram required {boolean} - Whether the member is required, indicates if we return a warning or an error
 * @pram member {MemberElement}
 * @returns {ParseResult<MemberElement<Copy>>}
 * @private
 */
function parseCopy(context, name, required, member) {
  const parseResult = parseString(context, name, required, member);
  const copyValue = R.compose(createCopy(context.namespace), getValue);
  return R.map(R.unless(isAnnotation, copyValue), parseResult);
}

module.exports = R.curry(parseCopy);
