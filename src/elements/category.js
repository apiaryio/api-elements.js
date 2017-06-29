export default function (namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class Category extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'category';
    }

    get resourceGroups() {
      return this.children.filter(item => item.classes.contains('resourceGroup'));
    }

    get dataStructures() {
      return this.children.filter(item => item.classes.contains('dataStructures'));
    }

    get scenarios() {
      return this.children.filter(item => item.classes.contains('scenario'));
    }

    get transitionGroups() {
      return this.children.filter(item => item.classes.contains('transitions'));
    }

    get authSchemeGroups() {
      return this.children.filter(item => item.classes.contains('authSchemes'));
    }

    get resources() {
      return this.children.filter(item => item.element === 'resource');
    }

    get transitions() {
      return this.children.filter(item => item.element === 'transition');
    }

    get authSchemes() {
      const schemes = ['Basic Authentication Scheme', 'Token Authentication Scheme', 'OAuth2 Scheme'];
      return this.children.filter(item => schemes.indexOf(item.element) !== -1);
    }

    metadata(value) {
      const metadata = this.attributes.get('meta');

      if (!metadata) {
        return undefined;
      }

      const result = metadata.children.filter(item => item.key.toValue() === value);

      if (!result.length) {
        return undefined;
      }

      return result.first().value;
    }
  }

  namespace.register('category', Category);
}
