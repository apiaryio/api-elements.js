/*
 * API-specific refract elements. General structure:
 *
 * + Category - API, resource group
 *   + Category
 *   + Copy
 *   + Resource
 *     + Transition
 *       + Transaction
 *         + Request
 *           + Asset
 *           + Message body
 *           + Message body schema
 *         + Response
 *           + Asset
 *           + Message body
 *           + Message body schema
 *     + Data structure
 *   + Data structure
 */

import {
  ArrayElement, BaseElement, ObjectElement, StringElement, registry
} from 'minim';
import {filterBy} from './util';

class HttpHeaders extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'httpHeaders';
  }

  exclude(name) {
    return this.filter(item => {
      let itemName = item.name;

      if (!itemName) {
        // This can't possibly match, so we include it in the results.
        return true;
      }

      // Note: this may not be a string, hence the duck-Element check below!
      return !(itemName.toLowerCase) || itemName.toLowerCase() !== name.toLowerCase();
    });
  }
}

class HrefVariables extends ObjectElement {
  constructor(...args) {
    super(...args);
    this.element = 'hrefVariables';
  }
}

export class Asset extends BaseElement {
  constructor(...args) {
    super(...args);
    this.element = 'asset';
  }

  get contentType() {
    return this.attributes.getValue('contentType');
  }

  set contentType(value) {
    this.attributes.set('contentType', value);
  }

  get href() {
    return this.attributes.getValue('href');
  }

  set href(value) {
    this.attributes.set('href', value);
  }
}

class HttpMessagePayload extends ArrayElement {
  constructor(...args) {
    super(...args);
    this._attributeElementKeys = ['headers'];
  }

  get headers() {
    return this.attributes.get('headers');
  }

  set headers(value) {
    this.attributes.set('headers', value);
  }

  header(name) {
    const headers = this.attributes.get('headers');
    let header = null;

    if (headers) {
      header = headers.content.filter(filterBy.bind(this, {
        name,
        ignoreCase: true
      }))[0];

      if (header) {
        header = header.toValue();
      }
    }

    return header;
  }

  get contentType() {
    if (this.header('Content-Type')) {
      return this.header('Content-Type');
    }

    return this.content && this.content.contentType;
  }

  get dataStructure() {
    return this.findByElement('dataStructure').first();
  }

  get messageBody() {
    // Returns the *first* message body. Only one should be defined according
    // to the spec, but it's possible to include more.
    return this.filter((item) => {
      return item.element === 'asset' && item.class.contains('messageBody');
    }).first();
  }

  get messageBodySchema() {
    // Returns the *first* message body schema. Only one should be defined
    // according to the spec, but it's possible to include more.
    return this.filter((item) => {
      return item.element === 'asset' && item.class.contains('messageBodySchema');
    }).first();
  }
}

export class HttpRequest extends HttpMessagePayload {
  constructor(...args) {
    super(...args);
    this.element = 'httpRequest';
  }

  get method() {
    return this.attributes.getValue('method');
  }

  set method(value) {
    this.attributes.set('method', value);
  }

  get href() {
    return this.attributes.getValue('href');
  }

  set href(value) {
    this.attributes.set('href', value);
  }
}

export class HttpResponse extends HttpMessagePayload {
  constructor(...args) {
    super(...args);
    this.element = 'httpResponse';
  }

  get statusCode() {
    return this.attributes.getValue('statusCode');
  }

  set statusCode(value) {
    this.attributes.set('statusCode', value);
  }
}

export class HttpTransaction extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'httpTransaction';
  }

  get request() {
    return this.findByElement('httpRequest').first();
  }

  get response() {
    return this.findByElement('httpResponse').first();
  }
}

export class Transition extends ArrayElement {
  constructor(...args) {
    super(...args);

    this.element = 'transition';
    this._attributeElementKeys = ['parameters', 'attributes'];
  }

  get method() {
    return this.transactions.get(0).request.method;
  }

  get relation() {
    return this.attributes.getValue('relation');
  }

  set relation(value) {
    this.attributes.set('relation', value);
  }

  get href() {
    return this.attributes.getValue('href');
  }

  set href(value) {
    this.attributes.set('href', value);
  }

  get computedHref() {
    try {
      return this.href ? this.href : this.transactions.get(0).request.href;
    } catch (err) {
      return null;
    }
  }

  get parameters() {
    return this.attributes.get('parameters');
  }

  set parameters(value) {
    this.attributes.set('parameters', value);
  }

  // The key `attributes` is already taken, so `attr` is used instead.
  get attr() {
    return this.attributes.get('attributes');
  }

  set attr(value) {
    this.attributes.set('attributes', value);
  }

  get transactions() {
    return this.findByElement('httpTransaction');
  }
}

export class Resource extends ArrayElement {
  constructor(...args) {
    super(...args);

    this.element = 'resource';
    this._attributeElementKeys = ['hrefVariables'];
  }

  get href() {
    return this.attributes.getValue('href');
  }

  set href(value) {
    this.attributes.set('href', value);
  }

  get hrefVariables() {
    return this.attributes.get('hrefVariables');
  }

  set hrefVariables(value) {
    this.attributes.set('hrefVariables', value);
  }

  get transitions() {
    return this.findByElement('transition');
  }

  get dataStructure() {
    return this.findByElement('dataStructure').first();
  }
}

export class DataStructure extends ObjectElement {
  constructor(...args) {
    super(...args);
    this.element = 'dataStructure';
  }
}

export class Copy extends StringElement {
  constructor(...args) {
    super(...args);
    this.element = 'copy';
  }

  get contentType() {
    return this.attributes.contentType;
  }

  set contentType(value) {
    this.attributes.set('contentType', value);
  }
}

export class Category extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'category';
  }

  get resourceGroups() {
    return this.findByClass('resourceGroup');
  }

  get dataStructures() {
    return this.findByClass('dataStructures');
  }

  get scenarios() {
    return this.findByClass('scenario');
  }

  get resources() {
    return this.findByElement('resource');
  }

  get copy() {
    return this.findByElement('copy');
  }
}

// Register the API and Resource element Elements.
registry
  .register('category', Category)
  .register('copy', Copy)
  .register('resource', Resource)
  .register('transition', Transition)
  .register('httpTransaction', HttpTransaction)
  .register('httpHeaders', HttpHeaders)
  .register('hrefVariables', HrefVariables)
  .register('asset', Asset)
  .register('httpRequest', HttpRequest)
  .register('httpResponse', HttpResponse)
  .register('dataStructure', DataStructure);
