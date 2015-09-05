export default function(namespace) {
  const StringElement = namespace.getElementClass('string');

  class Copy extends StringElement {
    constructor() {
      super(...arguments);
      this.element = 'copy';
    }

    get contentType() {
      return this.attributes.getValue('contentType');
    }

    set contentType(value) {
      this.attributes.set('contentType', value);
    }
  }

  namespace.register('copy', Copy);
}
