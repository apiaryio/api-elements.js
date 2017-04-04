export default function (namespace) {
  class Asset extends namespace.BaseElement {
    constructor(...args) {
      super(...args);
      this.element = 'asset';
    }

    get contentType() {
      return this.attributes.get('contentType');
    }

    set contentType(value) {
      this.attributes.set('contentType', value);
    }

    get href() {
      return this.attributes.get('href');
    }

    set href(value) {
      this.attributes.set('href', value);
    }
  }

  namespace.register('asset', Asset);
}
