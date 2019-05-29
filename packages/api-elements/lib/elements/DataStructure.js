const { Element } = require('minim');

/**
 * @class DataStructure
 *
 * @param {Element} content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class DataStructure extends Element {
  constructor(...args) {
    super(...args);
    this.element = 'dataStructure';

    if (this.content !== undefined) {
      this.content = this.refract(this.content);
    }
  }
}

module.exports = DataStructure;
