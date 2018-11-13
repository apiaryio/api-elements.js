const R = require('ramda');

const isAnnotation = (element) => element.element === 'annotation';
const isObject = (element) => element.element === 'object';
const isString = (element) => element.element === 'string';

module.exports = {
  isAnnotation,
  isObject,
  isString,
}
