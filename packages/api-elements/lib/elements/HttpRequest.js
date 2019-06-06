const HttpMessagePayload = require('./HttpMessagePayload');

/**
 * @class HttpRequest
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @extends HttpMessagePayload
 */
class HttpRequest extends HttpMessagePayload {
  constructor(...args) {
    super(...args);
    this.element = 'httpRequest';
  }

  /**
   * @name method
   * @type StringElement
   * @memberof HttpRequest.prototype
   */
  get method() {
    return this.attributes.get('method');
  }

  set method(value) {
    this.attributes.set('method', value);
  }

  /**
   * @name href
   * @type StringElement
   * @memberof HttpRequest.prototype
   */
  get href() {
    return this.attributes.get('href');
  }

  set href(value) {
    this.attributes.set('href', value);
  }

  /**
   * @name hrefVariables
   * @type ObjectElement
   * @memberof HttpRequest.prototype
   */
  get hrefVariables() {
    return this.attributes.get('hrefVariables');
  }

  set hrefVariables(value) {
    this.attributes.set('hrefVariables', value);
  }
}

module.exports = HttpRequest;
