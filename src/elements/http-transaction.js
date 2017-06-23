export default function (namespace) {
  const ArrayElement = namespace.getElementClass('array');
  const AuthScheme = namespace.getElementClass('authScheme');

  class HttpTransaction extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'httpTransaction';
    }

    get request() {
      return this.children.filter(item => item.element === 'httpRequest').first();
    }

    get response() {
      return this.children.filter(item => item.element === 'httpResponse').first();
    }

    get authSchemes() {
      return this.attributes.get('authSchemes')
        .map((element) => {
          if (element instanceof AuthScheme) {
            return element;
          }

          const authScheme = new AuthScheme([], element.meta, element.attributes);
          authScheme.element = element.element;
          authScheme.content = element.content;
          return authScheme;
        });
    }
  }

  namespace.register('httpTransaction', HttpTransaction);
}
