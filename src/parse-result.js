/*
 * Parse result-specific refract elements.
 *
 * General structure:
 *
 * + ParseResult
 *   + Annotation
 */

import apiDescription from 'minim-api-description';

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
      return this.children(item => item.classes.contains('api')).first();
    }

    get annotations() {
      return this.children(item => item.element === 'annotation');
    }

    get warnings() {
      return this.children(
        item => item.element === 'annotation' &&
        item.classes.contains('warning'));
    }

    get errors() {
      return this.children(
        item => item.element === 'annotation' &&
        item.classes.contains('error'));
    }
  }

  class Annotation extends StringElement {
    constructor(...args) {
      super(...args);
      this.element = 'annotation';
    }

    get code() {
      return this.attributes.get('code');
    }

    set code(value) {
      this.attributes.set('code', value);
    }
  }

  class SourceMap extends minim.BaseElement {
    constructor(...args) {
      super(...args);
      this.element = 'sourceMap';
    }
  }

  minim
    .use(apiDescription)
    .register('parseResult', ParseResult)
    .register('annotation', Annotation)
    .register('sourceMap', SourceMap);
}

export default { namespace };
