module.exports = (namespace) => {
  const ObjectElement = namespace.getElementClass('object');

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

  namespace.register('hrefVariables', HrefVariables);
}
