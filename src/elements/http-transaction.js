export default function (namespace) {
  const ArrayElement = namespace.getElementClass('array');
  const AuthScheme = namespace.getElementClass('authScheme');

  class HttpTransaction extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'httpTransaction';
    }

    get request() {
      return this.children(item => item.element === 'httpRequest').first();
    }

    get response() {
      return this.children(item => item.element === 'httpResponse').first();
    }

    get authSchemes() {
      return namespace.toElement(this.attributes.get('authSchemes').map(item => (new AuthScheme()).fromRefract(item)));
    }
  }

  namespace.register('httpTransaction', HttpTransaction);
}
