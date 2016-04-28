export default function(namespace) {
  class DataStructure extends namespace.BaseElement {
    constructor() {
      super(...arguments);
      this.element = 'dataStructure';
      if (this.content !== undefined) {
        this.content = namespace.toElement(this.content);
      }
    }

    toValue() {
      return this.content && this.content.toValue();
    }

    toRefract() {
      const refract = super.toRefract();
      refract.content = refract.content.toRefract();
      return refract;
    }

    fromRefract(doc) {
      super.fromRefract(doc);
      this.content = namespace.fromRefract(doc.content);
      return this;
    }
  }

  namespace.register('dataStructure', DataStructure);
}
