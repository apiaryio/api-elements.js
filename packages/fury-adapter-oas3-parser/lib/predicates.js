const R = require('ramda');

const isAnnotation = (element) => element.element === 'annotation';
const unlessAnnotation = R.unless(isAnnotation);

module.exports = {
  unlessAnnotation,
}
