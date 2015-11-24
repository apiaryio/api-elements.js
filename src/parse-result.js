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

  // First, modify the base and all currently registered elements to include
  // the new `sourceMap` attribute, which is an unrefracted array of
  // refracted source map elements.
  minim.BaseElement = class SourceMappedBase extends minim.BaseElement {
    constructor() {
      super(...arguments);
      this._attributeElementArrayKeys.push('sourceMap');
    }
  };

  Object.keys(minim.elementMap).forEach((key) => {
    const ElementClass = minim.elementMap[key];
    minim.elementMap[key] = class SourceMapped extends ElementClass {
      constructor() {
        super(...arguments);
        this._attributeElementArrayKeys.push('sourceMap');
      }
    };
  });

  class ParseResult extends ArrayElement {
    constructor() {
      super(...arguments);
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
    constructor() {
      super(...arguments);
      this.element = 'annotation';
    }

    get code() {
      return this.attributes.getValue('code');
    }

    set code(value) {
      this.attributes.set('code', value);
    }
  }

  class SourceMap extends minim.BaseElement {
    constructor() {
      super(...arguments);
      this.element = 'sourceMap';
    }
  }

  minim
    .use(apiDescription)
    .register('parseResult', ParseResult)
    .register('annotation', Annotation)
    .register('sourceMap', SourceMap);
}

export default {namespace};
