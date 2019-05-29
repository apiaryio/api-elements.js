module.exports = (namespace) => {
  const ArrayElement = namespace.getElementClass('array');

  /**
   * @class ParseResult
   *
   * @param {Array} content
   * @param meta
   * @param attributes
   *
   * @extends ArrayElement
   */
  class ParseResult extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'parseResult';
    }

    /**
     * @name api
     * @type Category
     * @memberof ParseResult.prototype
     */
    get api() {
      return this.children.filter(item => item.classes.contains('api')).first;
    }

    /**
     * @name annotations
     * @type ArraySlice
     * @memberof ParseResult.prototype
     */
    get annotations() {
      return this.children.filter(item => item.element === 'annotation');
    }

    /**
     * @name warnings
     * @type ArraySlice
     * @memberof ParseResult.prototype
     */
    get warnings() {
      return this.children
        .filter(item => item.element === 'annotation' && item.classes.contains('warning'));
    }

    /**
     * @name errors
     * @type ArraySlice
     * @memberof ParseResult.prototype
     */
    get errors() {
      return this.children
        .filter(item => item.element === 'annotation' && item.classes.contains('error'));
    }
  }

  namespace.register('parseResult', ParseResult);
};
