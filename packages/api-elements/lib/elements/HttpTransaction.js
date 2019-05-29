const { ArrayElement } = require('minim');

/**
 * @class HttpTransaction
 *
 * @param {Array} content
 * @param meta
 * @param attributes
 *
 * @extends ArrayElement
 */
class HttpTransaction extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'httpTransaction';
  }

  /**
   * @name request
   * @type HttpRequest
   * @memberof HttpTransaction.prototype
   */
  get request() {
    return this.children.filter(item => item.element === 'httpRequest').first;
  }

  /**
   * @name response
   * @type HttpResponse
   * @memberof HttpTransaction.prototype
   */
  get response() {
    return this.children.filter(item => item.element === 'httpResponse').first;
  }

  /**
   * @name authSchemes
   * @type ArrayElement
   * @memberof HttpTransaction.prototype
   */
  get authSchemes() {
    return this.attributes.get('authSchemes');
  }
}

module.exports = HttpTransaction;
