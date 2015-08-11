/*
 * Parse result-specific refract elements. Includes the API namespace.
 * General structure:
 *
 * + ParseResult
 *   + Annotation
 */

import {
  ArrayElement, StringElement, registry
} from 'minim';

import './api';

export class ParseResult extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'parseResult';
  }

  get api() {
    return this.findByClass('api').first();
  }

  get annotations() {
    return this.findByElement('annotation');
  }
}

export class Annotation extends StringElement {
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

// Register the Parse Result element Elements.
registry
  .register('parseResult', ParseResult)
  .register('annotation', Annotation);
