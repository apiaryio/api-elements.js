const R = require('ramda');
const { isString, getValue } = require('../predicates');

const createCopy = R.curry((minim, element) => {
  const copy = new minim.elements.Copy(element.content);
  copy.attributes.set('sourceMap', element.attributes.get('sourceMap'));
  return copy;
});

/**
 * Parse a string element into a copy element, or a warning if the given
 * element is not a string.
 *
 * @param minim
 * @param createAnnotation {function}
 * @param member {MemberElement}
 *
 * @returns {Element} Either a Copy or Annotation.
 */
module.exports = R.curry((minim, createAnnotation, member) => {
  const parseCopy = R.ifElse(
    R.compose(isString, getValue),
    R.compose(createCopy(minim), getValue),
    createAnnotation
  );

  return parseCopy(member);
});
