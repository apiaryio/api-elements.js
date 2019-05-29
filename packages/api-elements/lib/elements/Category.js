const { ArrayElement } = require('minim');

/**
 * @class Category
 *
 * @param {Array} content
 * @param meta
 * @param attributes
 *
 * @extends ArrayElement
 */
class Category extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'category';
  }

  /**
   * @name resourceGroups
   * @type ArraySlice
   * @memberof Category.prototype
   */
  get resourceGroups() {
    return this.children.filter(item => item.classes.contains('resourceGroup'));
  }

  /**
   * @name dataStructures
   * @type ArraySlice
   * @memberof Category.prototype
   */
  get dataStructures() {
    return this.children.filter(item => item.classes.contains('dataStructures'));
  }

  get scenarios() {
    return this.children.filter(item => item.classes.contains('scenario'));
  }

  get transitionGroups() {
    return this.children.filter(item => item.classes.contains('transitions'));
  }

  /**
   * @name authSchemeGroups
   * @type ArraySlice
   * @memberof Category.prototype
   */
  get authSchemeGroups() {
    return this.children.filter(item => item.classes.contains('authSchemes'));
  }

  /**
   * @name resources
   * @type ArraySlice
   * @memberof Category.prototype
   */
  get resources() {
    return this.children.filter(item => item.element === 'resource');
  }

  /**
   * @name transitions
   * @type ArraySlice
   * @memberof Category.prototype
   */
  get transitions() {
    return this.children.filter(item => item.element === 'transition');
  }

  /**
   * @name authSchemes
   * @type ArraySlice
   * @memberof Category.prototype
   */
  get authSchemes() {
    const schemes = ['Basic Authentication Scheme', 'Token Authentication Scheme', 'OAuth2 Scheme'];
    return this.children.filter(item => schemes.indexOf(item.element) !== -1);
  }

  metadata(value) {
    const metadata = this.attributes.get('metadata');

    if (!metadata) {
      return undefined;
    }

    const result = metadata.children.filter(item => item.key.toValue() === value);

    if (result.isEmpty) {
      return undefined;
    }

    return result.first.value;
  }
}

module.exports = Category;
