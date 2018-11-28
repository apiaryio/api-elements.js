module.exports = (namespace) => {
  const ArrayElement = namespace.getElementClass('array');

  /**
   * @class AuthScheme
   *
   * @param {Array} content
   * @param meta
   * @param attributes
   *
   * @extends ArrayElement
   */
  class AuthScheme extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'authScheme';
    }

    /**
     * @name transitions
     * @type ArraySlice
     * @memberof HttpMessagePayload.prototype
     */
    get transitions() {
      return this.children.filter(item => item.element === 'transition');
    }

    /**
     * @name members
     * @type ArraySlice
     * @memberof HttpMessagePayload.prototype
     */
    get members() {
      return this.children.filter(item => item.element === 'member');
    }
  }

  namespace.register('authScheme', AuthScheme);
  namespace.register('Basic Authentication Scheme', AuthScheme);
  namespace.register('Token Authentication Scheme', AuthScheme);
  namespace.register('OAuth2 Scheme', AuthScheme);
}
