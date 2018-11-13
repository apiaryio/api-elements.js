const R = require('ramda');

const isAnnotation = (element) => element.element === 'annotation';
const isObject = (element) => element.element === 'object';

module.exports = {
  isAnnotation,
  isObject,
}
