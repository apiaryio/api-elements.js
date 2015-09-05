export default function(namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class HttpTransaction extends ArrayElement {
    constructor() {
      super(...arguments);
      this.element = 'httpTransaction';
    }

    get request() {
      return this.children((item) => item.element === 'httpRequest').first();
    }

    get response() {
      return this.children((item) => item.element === 'httpResponse').first();
    }
  }

  namespace.register('httpTransaction', HttpTransaction);
}
