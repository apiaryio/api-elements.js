const { ArrayElement } = require('minim');

/**
 * @class HttpMessagePayload
 *
 * @param {Array} content
 * @param meta
 * @param attributes
 *
 * @extends ArrayElement
 */
class HttpMessagePayload extends ArrayElement {
  /**
   * @name headers
   * @type HttpHeaders
   * @memberof HttpMessagePayload.prototype
   */
  get headers() {
    return this.attributes.get('headers');
  }

  set headers(value) {
    this.attributes.set('headers', value);
  }

  header(name) {
    const headers = this.attributes.get('headers');
    let header = null;

    if (headers) {
      header = headers.include(name).map(item => item.value);
    }

    return header;
  }

  /**
   * @name contentType
   * @type StringElement
   * @memberof HttpMessagePayload.prototype
   */
  get contentType() {
    const header = this.header('Content-Type');

    if (header) {
      return header[0];
    }

    return this.content && this.content.contentType;
  }

  /**
   * @name dataStructure
   * @type Asset
   * @memberof HttpMessagePayload.prototype
   */
  get dataStructure() {
    return this.findByElement('dataStructure').first;
  }

  /**
   * @name messageBody
   * @type Asset
   * @memberof HttpMessagePayload.prototype
   */
  get messageBody() {
    // Returns the *first* message body. Only one should be defined according
    // to the spec, but it's possible to include more.
    return this.filter(item => item.element === 'asset' && item.classes.contains('messageBody')).first;
  }

  /**
   * @name messageBodySchema
   * @type Asset
   * @memberof HttpMessagePayload.prototype
   */
  get messageBodySchema() {
    // Returns the *first* message body schema. Only one should be defined
    // according to the spec, but it's possible to include more.
    return this.filter(item => item.element === 'asset' && item.classes.contains('messageBodySchema')).first;
  }
}

module.exports = HttpMessagePayload;
