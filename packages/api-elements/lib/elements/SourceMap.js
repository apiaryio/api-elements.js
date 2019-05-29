const { ArrayElement } = require('minim');

/**
 * @class SourceMap
 *
 * @param {Array} content
 * @param meta
 * @param attributes
 *
 * @extends ArrayElement
 */
class SourceMap extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'sourceMap';
  }

  // Override toValue because until Refract 1.0
  // sourceMap is special element that contains array of array
  // TODO Remove in next minor release
  toValue() {
    return this.content.map(value => value.map(element => element.toValue()));
  }
}

module.exports = SourceMap;
