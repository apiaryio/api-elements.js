export default function(namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class Resource extends ArrayElement {
    constructor() {
      super(...arguments);

      this.element = 'resource';
      this._attributeElementKeys = ['hrefVariables'];
    }

    get href() {
      return this.attributes.getValue('href');
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
      return this.children((item) => item.element === 'transition');
    }

    get dataStructure() {
      return this.children((item) => item.element === 'dataStructure').first();
    }
  }

  namespace.register('resource', Resource);
}
