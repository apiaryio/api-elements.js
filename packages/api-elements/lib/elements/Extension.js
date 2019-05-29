const { Element } = require('minim');

class Extension extends Element {
  constructor(...args) {
    super(...args);
    this.element = 'extension';
  }

  get profile() {
    return this.links
      .filter(link => link.relation.toValue() === 'profile')
      .map(link => link.href)
      .shift();
  }
}

module.exports = Extension;
