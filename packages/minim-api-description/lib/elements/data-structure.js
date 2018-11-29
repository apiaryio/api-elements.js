module.exports = (namespace) => {
  /**
   * @class DataStructure
   *
   * @param {Element} content
   * @param meta
   * @param attributes
   *
   * @extends Element
   */
  class DataStructure extends namespace.Element {
    constructor(...args) {
      super(...args);
      this.element = 'dataStructure';

      if (this.content !== undefined) {
        this.content = namespace.toElement(this.content);
      }
    }
  }

  namespace.register('dataStructure', DataStructure);
};
