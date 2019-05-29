const { ArrayElement } = require('minim');

/**
 * @class Transition
 *
 * @param {Array} content
 * @param meta
 * @param attributes
 *
 * @extends ArrayElement
 */
class Transition extends ArrayElement {
  constructor(...args) {
    super(...args);

    this.element = 'transition';
  }

  /**
   * @name method
   * @type StringElement
   * @memberof Transition.prototype
   */
  get method() {
    const transaction = this.transactions.first;

    if (transaction) {
      const { request } = transaction;

      if (request) {
        return request.method;
      }
    }

    return undefined;
  }

  /**
   * @name relation
   * @type StringElement
   * @memberof Transition.prototype
   */
  get relation() {
    return this.attributes.get('relation');
  }

  set relation(value) {
    this.attributes.set('relation', value);
  }

  /**
   * @name href
   * @type StringElement
   * @memberof Transition.prototype
   */
  get href() {
    return this.attributes.get('href');
  }

  set href(value) {
    this.attributes.set('href', value);
  }

  get computedHref() {
    try {
      return this.href ? this.href : this.transactions.get(0).request.href;
    } catch (err) {
      return null;
    }
  }

  /**
   * @name hrefVariables
   * @type HrefVariables
   * @memberof Transition.prototype
   */
  get hrefVariables() {
    return this.attributes.get('hrefVariables');
  }

  set hrefVariables(value) {
    this.attributes.set('hrefVariables', value);
  }

  /**
   * @name data
   * @type DataStructure
   * @memberof Transition.prototype
   */
  get data() {
    return this.attributes.get('data');
  }

  set data(value) {
    this.attributes.set('data', value);
  }

  /**
   * @name contentTypes
   * @type ArrayElement
   * @memberof Transition.prototype
   */
  get contentTypes() {
    return this.attributes.get('contentTypes');
  }

  set contentTypes(value) {
    this.attributes.set('contentTypes', value);
  }

  /**
   * @name transactions
   * @type ArraySlice
   * @memberof Transition.prototype
   */
  get transactions() {
    return this.children.filter(item => item.element === 'httpTransaction');
  }
}

module.exports = Transition;
