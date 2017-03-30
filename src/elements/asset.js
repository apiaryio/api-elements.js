export default function (namespace) {
  class Asset extends namespace.BaseElement {
    constructor(...args) {
      super(...args);
      this.element = 'asset';
    }

    get contentType() {
      return this.attributes.getValue('contentType');
    }

    set contentType(value) {
      this.attributes.set('contentType', value);
    }

    get href() {
      return this.attributes.getValue('href');
    }

    set href(value) {
      this.attributes.set('href', value);
    }
  }

  namespace.register('asset', Asset);
}
