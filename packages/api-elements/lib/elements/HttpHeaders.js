const { ArrayElement } = require('minim');

/**
 * @class HttpHeaders
 *
 * @param {Array} content
 * @param meta
 * @param attributes
 *
 * @extends ArrayElement
 */
class HttpHeaders extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'httpHeaders';
  }

  toValue() {
    // eslint-disable-next-line arrow-body-style
    return this.map((item) => {
      return { key: item.key.toValue(), value: item.value.toValue() };
    });
  }

  include(name) {
    return this.filter((item) => {
      const key = item.key.toValue();

      // Note: this may not be a string, hence the duck-Element check below!
      return !(key.toLowerCase) || key.toLowerCase() === name.toLowerCase();
    });
  }

  exclude(name) {
    return this.filter((item) => {
      const key = item.key.toValue();

      // Note: this may not be a string, hence the duck-Element check below!
      return !(key.toLowerCase) || key.toLowerCase() !== name.toLowerCase();
    });
  }
}

module.exports = HttpHeaders;
