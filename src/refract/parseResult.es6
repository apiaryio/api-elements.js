/*
 * Parse result-specific refract elements. Includes the API namespace.
 * General structure:
 *
 * + ParseResult
 *   + Annotation
 */

export function namespace(options) {
  const minim = options.base;
  const ArrayElement = minim.getElementClass('array');
  const StringElement = minim.getElementClass('string');

  class ParseResult extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'parseResult';
    }

    get api() {
      return this.children((item) => item.classes.contains('api')).first();
    }

    get annotations() {
      return this.children((item) => item.element === 'annotation');
    }
  }

  class Annotation extends StringElement {
    constructor(...args) {
      super(...args);
      this.element = 'annotation';
    }

    get code() {
      return this.attributes.getValue('code');
    }

    set code(value) {
      this.attributes.set('code', value);
    }
  }

  minim
    .register('parseResult', ParseResult)
    .register('annotation', Annotation);
}

export default {namespace};
