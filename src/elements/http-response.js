export default function(namespace, HttpMessagePayload) {
  class HttpResponse extends HttpMessagePayload {
    constructor() {
      super(...arguments);
      this.element = 'httpResponse';
    }

    get statusCode() {
      return this.attributes.getValue('statusCode');
    }

    set statusCode(value) {
      this.attributes.set('statusCode', value);
    }
  }

  namespace.register('httpResponse', HttpResponse);
}
