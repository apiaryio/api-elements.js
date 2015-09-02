export default function(namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class HttpMessagePayload extends ArrayElement {
    constructor() {
      super(...arguments);
      this._attributeElementKeys = ['headers'];
    }

    get headers() {
      return this.attributes.get('headers');
    }

    set headers(value) {
      this.attributes.set('headers', value);
    }

    header(name) {
      const headers = this.attributes.get('headers');
      let header = null;

      if (headers) {
        header = headers.include(name).map(item => {
          return item.value.toValue();
        });
      }

      return header;
    }

    get contentType() {
      const header = this.header('Content-Type');
      if (header) {
        return header.join(', ');
      }

      return this.content && this.content.contentType;
    }

    get dataStructure() {
      return this.findByElement('dataStructure').first();
    }

    get messageBody() {
      // Returns the *first* message body. Only one should be defined according
      // to the spec, but it's possible to include more.
      return this.filter((item) => {
        return item.element === 'asset' && item.classes.contains('messageBody');
      }).first();
    }

    get messageBodySchema() {
      // Returns the *first* message body schema. Only one should be defined
      // according to the spec, but it's possible to include more.
      return this.filter((item) => {
        return item.element === 'asset' && item.classes.contains('messageBodySchema');
      }).first();
    }
  }

  require('./http-request')(namespace, HttpMessagePayload);
  require('./http-response')(namespace, HttpMessagePayload);
}
