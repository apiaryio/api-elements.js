const R = require('ramda');

const isAnnotation = (element) => element.element === 'annotation';
const isMember = (element) => element.element === 'member';
const isObject = (element) => element.element === 'object';
const isParseResult = element => element.element === 'parseResult';
const isString = (element) => element.element === 'string';

module.exports = {
  isAnnotation,
  isMember,
  isObject,
  isParseResult,
  isString,
}
