export default function(namespace) {
  const ArrayElement = namespace.getElementClass('array');

  class AuthScheme extends ArrayElement {
    constructor() {
      super(...arguments);
      this.element = 'authScheme';
    }

    get transitions() {
      return this.children((item) => item.element === 'transition');
    }

    get members() {
      return this.children((item) => item.element === 'member');
    }
  }

  namespace.register('authScheme', AuthScheme);
  namespace.register('Basic Authentication Scheme', AuthScheme);
  namespace.register('Token Authentication Scheme', AuthScheme);
  namespace.register('OAuth2 Scheme', AuthScheme);
}
