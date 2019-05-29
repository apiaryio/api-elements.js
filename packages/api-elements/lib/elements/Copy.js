const {
  StringElement, ArrayElement,
} = require('minim');

/**
 * @name copy
 * @type Copy
 * @memberof Element.prototype
 */
if (!Object.getOwnPropertyNames(ArrayElement.prototype).includes('copy')) {
  Object.defineProperty(ArrayElement.prototype, 'copy', {
    get() {
      return this.children.filter(item => item.element === 'copy');
    },
  });
}

/**
 * @class Copy
 *
 * @param {string} content
 * @param meta
 * @param attributes
 *
 * @extends StringElement
 */
class Copy extends StringElement {
  constructor(...args) {
    super(...args);
    this.element = 'copy';
  }

  /**
   * @name contentType
   * @type StringElement
   * @memberof Copy.prototype
   */
  get contentType() {
    return this.attributes.get('contentType');
  }

  set contentType(value) {
    this.attributes.set('contentType', value);
  }
}

module.exports = Copy;
