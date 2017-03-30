export default function (namespace, HttpMessagePayload) {
  class HttpRequest extends HttpMessagePayload {
    constructor(...args) {
      super(...args);
      this.element = 'httpRequest';
    }

    get method() {
      return this.attributes.getValue('method');
    }

    set method(value) {
      this.attributes.set('method', value);
    }

    get href() {
      return this.attributes.getValue('href');
    }

    set href(value) {
      this.attributes.set('href', value);
    }
  }

  namespace.register('httpRequest', HttpRequest);
}
