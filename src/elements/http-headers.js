export default function(namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class HttpHeaders extends ArrayElement {
    constructor() {
      super(...arguments);
      this.element = 'httpHeaders';
    }

    toValue() {
      return this.map(item => [item.key.toValue(), item.value.toValue()]);
    }

    include(name) {
      return this.filter(item => {
        const key = item.key.toValue();

        // Note: this may not be a string, hence the duck-Element check below!
        return !(key.toLowerCase) || key.toLowerCase() === name.toLowerCase();
      });
    }

    exclude(name) {
      return this.filter(item => {
        const key = item.key.toValue();

        // Note: this may not be a string, hence the duck-Element check below!
        return !(key.toLowerCase) || key.toLowerCase() !== name.toLowerCase();
      });
    }
  }

  namespace.register('httpHeaders', HttpHeaders);
}
