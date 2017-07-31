export default function (namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class Resource extends ArrayElement {
    constructor(...args) {
      super(...args);

      this.element = 'resource';
    }

    get href() {
      return this.attributes.get('href');
    }

    set href(value) {
      this.attributes.set('href', value);
    }

    get hrefVariables() {
      return this.attributes.get('hrefVariables');
    }

    set hrefVariables(value) {
      this.attributes.set('hrefVariables', value);
    }

    get transitions() {
      return this.children.filter(item => item.element === 'transition');
    }

    get dataStructure() {
      return this.children.filter(item => item.element === 'dataStructure').first;
    }
  }

  namespace.register('resource', Resource);
}
