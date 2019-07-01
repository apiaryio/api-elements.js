const { Element } = require('minim');

module.exports = () => {
  /**
   * @name sourceMapValue
   * @type Array
   * @memberof Element.prototype
   */
  if (!Object.getOwnPropertyNames(Element.prototype).includes('sourceMapValue')) {
    Object.defineProperty(Element.prototype, 'sourceMapValue', {
      get() {
        const sourceMap = this.attributes.get('sourceMap');

        if (sourceMap) {
          return sourceMap.first.toValue();
        }

        return undefined;
      },
    });
  }
};
