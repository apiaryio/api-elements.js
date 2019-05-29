const HttpMessagePayload = require('./HttpMessagePayload');

/**
 * @class HttpResponse
 *
 * @param content
 * @param meta
 * @param attributes
 *
 * @extends HttpMessagePayload
 */
class HttpResponse extends HttpMessagePayload {
  constructor(...args) {
    super(...args);
    this.element = 'httpResponse';
  }

  /**
   * @name statusCode
   * @type NumberElement
   * @memberof HttpResponse.prototype
   */
  get statusCode() {
    return this.attributes.get('statusCode');
  }

  set statusCode(value) {
    this.attributes.set('statusCode', value);
  }
}

module.exports = HttpResponse;
