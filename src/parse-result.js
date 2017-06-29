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
  const Element = minim.Element;
  const StringElement = minim.getElementClass('string');
  const ArrayElement = minim.getElementClass('array');

  class ParseResult extends ArrayElement {
    constructor(...args) {
      super(...args);
      this.element = 'parseResult';
    }

    get api() {
      return this.children.filter(item => item.classes.contains('api')).first();
    }

    get annotations() {
      return this.children.filter(item => item.element === 'annotation');
    }

    get warnings() {
      return this.children.filter(
        item => item.element === 'annotation' &&
        item.classes.contains('warning'));
    }

    get errors() {
      return this.children.filter(
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

  class SourceMap extends minim.Element {
    constructor(...args) {
      super(...args);
      this.element = 'sourceMap';
    }

    // Override toValue because until Refract 1.0
    // sourceMap is special element that contains array of array
    // TODO Remove in next minor release
    toValue() {
      return this.content.map(value => value.map(element => element.toValue()));
    }
  }

  if (!Object.getOwnPropertyNames(Element.prototype).includes('sourceMapValue')) {
    Object.defineProperty(Element.prototype, 'sourceMapValue', {
      get() {
        const sourceMap = this.attributes.get('sourceMap');

        if (sourceMap) {
          return sourceMap.first().toValue();
        }

        return undefined;
      },
    });
  }

  minim
    .use(apiDescription)
    .register('parseResult', ParseResult)
    .register('annotation', Annotation)
    .register('sourceMap', SourceMap);
}

export default { namespace };
