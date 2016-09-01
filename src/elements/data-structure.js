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

      if (Array.isArray(this.content)) {
        refract.content = this.content.map(item => item.toRefract());
      } else {
        refract.content = this.content.toRefract();
      }

      return refract;
    }

    fromRefract(doc) {
      super.fromRefract(doc);

      if (Array.isArray(doc.content)) {
        this.content = doc.content.map(item => namespace.fromRefract(item));
      } else {
        this.content = namespace.fromRefract(doc.content);
      }

      return this;
    }
  }

  namespace.register('dataStructure', DataStructure);
}
