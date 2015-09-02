export default function(namespace) {
  const ObjectElement = namespace.getElementClass('object');

  class HrefVariables extends ObjectElement {
    constructor() {
      super(...arguments);
      this.element = 'hrefVariables';
    }
  }

  namespace.register('hrefVariables', HrefVariables);
}
