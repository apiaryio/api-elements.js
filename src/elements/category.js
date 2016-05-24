export default function(namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class Category extends ArrayElement {
    constructor() {
      super(...arguments);
      this.element = 'category';
    }

    get resourceGroups() {
      return this.children((item) => item.classes.contains('resourceGroup'));
    }

    get dataStructures() {
      return this.children((item) => item.classes.contains('dataStructures'));
    }

    get scenarios() {
      return this.children((item) => item.classes.contains('scenario'));
    }

    get transitionGroups() {
      return this.children((item) => item.classes.contains('transitions'));
    }

    get authSchemeGroups() {
      return this.children((item) => item.classes.contains('authSchemes'));
    }

    get resources() {
      return this.children((item) => item.element === 'resource');
    }

    get transitions() {
      return this.children((item) => item.element === 'transition');
    }

    get authSchemes() {
      const schemes = ['Basic Authentication Scheme', 'Token Authentication Scheme', 'OAuth2 Scheme'];
      return this.children((item) => schemes.indexOf(item.element) !== -1);
    }
  }

  namespace.register('category', Category);
}
