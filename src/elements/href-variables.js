export default function (namespace) {
  const ObjectElement = namespace.getElementClass('object');

  class HrefVariables extends ObjectElement {
    constructor(...args) {
      super(...args);
      this.element = 'hrefVariables';
    }
  }

  namespace.register('hrefVariables', HrefVariables);
}
