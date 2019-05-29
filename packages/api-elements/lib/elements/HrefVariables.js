const { ObjectElement } = require('minim');

/**
 * @class HrefVariables
 *
 * @param {Array} content
 * @param meta
 * @param attributes
 *
 * @extends ObjectElement
 */
class HrefVariables extends ObjectElement {
  constructor(...args) {
    super(...args);
    this.element = 'hrefVariables';
  }
}


module.exports = HrefVariables;
