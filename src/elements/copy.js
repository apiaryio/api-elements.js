export default function (namespace) {
  const StringElement = namespace.getElementClass('string');
  const ArrayElement = namespace.getElementClass('array');

  if (!Object.getOwnPropertyNames(ArrayElement.prototype).includes('copy')) {
    Object.defineProperty(ArrayElement.prototype, 'copy', {
      get() {
        return this.children.filter(item => item.element === 'copy');
      },
    });
  }

  class Copy extends StringElement {
    constructor(...args) {
      super(...args);
      this.element = 'copy';
    }

    get contentType() {
      return this.attributes.get('contentType');
    }

    set contentType(value) {
      this.attributes.set('contentType', value);
    }
  }

  namespace.register('copy', Copy);
}
