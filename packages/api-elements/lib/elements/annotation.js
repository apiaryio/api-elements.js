module.exports = (namespace) => {
  const StringElement = namespace.getElementClass('string');

  /**
   * @class Annotation
   *
   * @param {string} content
   * @param meta
   * @param attributes
   *
   * @extends StringElement
   */
  class Annotation extends StringElement {
    constructor(...args) {
      super(...args);
      this.element = 'annotation';
    }

    get code() {
      return this.attributes.get('code');
    }

    set code(value) {
      this.attributes.set('code', value);
    }
  }

  namespace.register('annotation', Annotation);
};
