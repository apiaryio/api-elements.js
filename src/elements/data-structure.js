export default function (namespace) {
  class DataStructure extends namespace.Element {
    constructor(...args) {
      super(...args);
      this.element = 'dataStructure';

      if (this.content !== undefined) {
        this.content = namespace.toElement(this.content);
      }
    }
  }

  namespace.register('dataStructure', DataStructure);
}
