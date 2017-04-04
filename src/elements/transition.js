export default function (namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class Transition extends ArrayElement {
    constructor(...args) {
      super(...args);

      this.element = 'transition';
    }

    get method() {
      const transaction = this.transactions.first();

      if (transaction) {
        const request = transaction.request;

        if (request) {
          return request.method;
        }
      }

      return undefined;
    }

    get relation() {
      return this.attributes.get('relation');
    }

    set relation(value) {
      this.attributes.set('relation', value);
    }

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

    get hrefVariables() {
      return this.attributes.get('hrefVariables');
    }

    set hrefVariables(value) {
      this.attributes.set('hrefVariables', value);
    }

    get data() {
      return this.attributes.get('data');
    }

    set data(value) {
      this.attributes.set('data', value);
    }

    get contentTypes() {
      return this.attributes.get('contentTypes');
    }

    set contentTypes(value) {
      this.attributes.set('contentTypes', value);
    }

    get transactions() {
      return this.children(item => item.element === 'httpTransaction');
    }
  }

  namespace.register('transition', Transition);
}
