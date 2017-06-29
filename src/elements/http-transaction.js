export default function (namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class HttpTransaction extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'httpTransaction';
    }

    get request() {
      return this.children.filter(item => item.element === 'httpRequest').first();
    }

    get response() {
      return this.children.filter(item => item.element === 'httpResponse').first();
    }

    get authSchemes() {
      return this.attributes.get('authSchemes');
    }
  }

  namespace.register('httpTransaction', HttpTransaction);
}
