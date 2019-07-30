const { ArrayElement } = require('minim');

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
   * @memberof AuthScheme.prototype
   */
  get transitions() {
    return this.children.filter(item => item.element === 'transition');
  }

  /**
   * @name members
   * @type ArraySlice
   * @memberof AuthScheme.prototype
   */
  get members() {
    return this.children.filter(item => item.element === 'member');
  }

  /**
   * @name grantTypeValue
   * @memberof AuthScheme.prototype
   */
  get grantTypeValue() {
    const grantType = this.members.find(item => item.key.toValue() === 'grantType');

    if (grantType && grantType.value) {
      return grantType.value.toValue();
    }

    return undefined;
  }
}

module.exports = AuthScheme;
