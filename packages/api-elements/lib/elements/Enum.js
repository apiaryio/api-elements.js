const { Element, ArrayElement } = require('minim');

/**
 * @class Enum
 *
 * @param {Element} content
 * @param meta
 * @param attributes
 *
 * @extends Element
 */
class Enum extends Element {
  constructor(content, meta, attributes) {
    super(undefined, meta, attributes);
    this.element = 'enum';
    this.content = this.refract(content);
  }

  /**
   * @name enumerations
   * @type ArrayElement
   * @memberof Enum.prototype
   */
  get enumerations() {
    return this.attributes.get('enumerations');
  }

  set enumerations(values) {
    let enumerations;

    if (values instanceof ArrayElement) {
      enumerations = values;
    } else if (Array.isArray(values)) {
      enumerations = new ArrayElement(values);
    } else {
      enumerations = new ArrayElement();
    }

    this.attributes.set('enumerations', enumerations);
  }
}

module.exports = Enum;
