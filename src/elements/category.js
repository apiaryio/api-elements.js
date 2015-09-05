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

    get resources() {
      return this.children((item) => item.element === 'resource');
    }

    get transitions() {
      return this.children((item) => item.element === 'transition');
    }

    get copy() {
      return this.children((item) => item.element === 'copy');
    }
  }

  namespace.register('category', Category);
}
