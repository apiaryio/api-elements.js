export default function (namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class Enum extends namespace.Element {
    constructor(content, meta, attributes) {
      super(namespace.toElement(content), meta, attributes);
      this.element = 'enum';
    }

    get enumerations() {
      return this.attributes.get('enumerations');
    }

    set enumerations(values) {
      let enumerations;

      if (values instanceof ArrayElement) {
        enumerations = values;
      } else if (Array.isArray(values)) {
        enumerations = new ArrayElement(values);
      } else {
        enumerations = new ArrayElement();
      }

      this.attributes.set('enumerations', enumerations);
    }
  }

  namespace.register('enum', Enum);
}
