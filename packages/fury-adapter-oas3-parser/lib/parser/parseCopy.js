const R = require('ramda');
const { isAnnotation, getValue } = require('../predicates');
const parseString = require('./parseString');

const createCopy = R.curry((minim, element) => {
  const copy = new minim.elements.Copy(element.content);
  copy.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return copy;
});

/**
 * Parse a string from a member into a copy element
 * @pram minim
 * @pram name {string}
 * @pram required {boolean} - Whether the member is required, indicates if we return a warning or an error
 * @pram member {MemberElement}
 * @returns {ParseResult<MemberElement<Copy>>}
 */
function parseCopy(minim, name, required, member) {
  const parseResult = parseString(minim, name, required, member);
  const copyValue = R.compose(createCopy(minim), getValue);
  return R.map(R.unless(isAnnotation, copyValue), parseResult);
}

module.exports = R.curry(parseCopy);
