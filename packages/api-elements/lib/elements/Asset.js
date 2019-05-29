const { Element } = require('minim');

/**
 * @class Asset
 *
 * @param {string} content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class Asset extends Element {
  constructor(...args) {
    super(...args);
    this.element = 'asset';
  }

  /**
   * @name contentType
   * @type StringElement
   * @memberof Asset.prototype
   */
  get contentType() {
    return this.attributes.get('contentType');
  }

  set contentType(value) {
    this.attributes.set('contentType', value);
  }

  /**
   * @name href
   * @type StringElement
   * @memberof Asset.prototype
   */
  get href() {
    return this.attributes.get('href');
  }

  set href(value) {
    this.attributes.set('href', value);
  }
}

module.exports = Asset;
