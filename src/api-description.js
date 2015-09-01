/*
 * API description-specific refract elements.
 * General structure:
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
 *   + Transition
 *   + Data structure
 */

import {
  ArrayElement, BaseElement, ObjectElement, StringElement, registry
} from 'minim';

export class HttpHeaders extends ArrayElement {
  constructor(...args) {
    super(...args);
    this.element = 'httpHeaders';
  }

  toValue() {
    return this.map(item => [item.key.toValue(), item.value.toValue()]);
  }

  include(name) {
    return this.filter(item => {
      const key = item.key.toValue();

      // Note: this may not be a string, hence the duck-Element check below!
      return !(key.toLowerCase) || key.toLowerCase() === name.toLowerCase();
    });
  }

  exclude(name) {
    return this.filter(item => {
      const key = item.key.toValue();

      // Note: this may not be a string, hence the duck-Element check below!
      return !(key.toLowerCase) || key.toLowerCase() !== name.toLowerCase();
    });
  }
}

export class HrefVariables extends ObjectElement {
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

export class HttpMessagePayload extends ArrayElement {
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
      header = headers.include(name).map(item => {
        return item.value.toValue();
      });
    }

    return header;
  }

  get contentType() {
    const header = this.header('Content-Type');
    if (header) {
      return header.join(', ');
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
      return item.element === 'asset' && item.classes.contains('messageBody');
    }).first();
  }

  get messageBodySchema() {
    // Returns the *first* message body schema. Only one should be defined
    // according to the spec, but it's possible to include more.
    return this.filter((item) => {
      return item.element === 'asset' && item.classes.contains('messageBodySchema');
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
    return this.children((item) => item.element === 'httpRequest').first();
  }

  get response() {
    return this.children((item) => item.element === 'httpResponse').first();
  }
}

export class Transition extends ArrayElement {
  constructor(...args) {
    super(...args);

    this.element = 'transition';
    this._attributeElementKeys = ['hrefVariables', 'data'];
  }

  get method() {
    const transaction = this.transactions.first();
    if (transaction) {
      const request = transaction.request;
      if (request) {
        return request.method;
      }
    }
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

  get hrefVariables() {
    return this.attributes.get('hrefVariables');
  }

  set hrefVariables(value) {
    this.attributes.set('hrefVariables', value);
  }

  get data() {
    return this.attributes.get('data');
  }

  set data(value) {
    this.attributes.set('data', value);
  }

  get contentTypes() {
    return this.attributes.get('contentTypes');
  }

  set contentTypes(value) {
    this.attributes.set('contentTypes', value);
  }

  get transactions() {
    return this.children((item) => item.element === 'httpTransaction');
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
    return this.children((item) => item.element === 'transition');
  }

  get dataStructure() {
    return this.children((item) => item.element === 'dataStructure').first();
  }
}

export class DataStructure extends BaseElement {
  constructor(...args) {
    super(...args);
    this.element = 'dataStructure';
    if (this.content !== undefined) {
      this.content = registry.toElement(this.content);
    }
  }

  toValue() {
    return this.content && this.content.toValue();
  }

  toRefract() {
    const refract = super.toRefract();
    refract.content = refract.content.toRefract();
    return refract;
  }

  toCompactRefract() {
    const compactRefract = super.toCompactRefract();
    compactRefract[3] = compactRefract[3].toCompactRefract();
    return compactRefract;
  }

  fromRefract(doc) {
    super.fromRefract(doc);
    this.content = registry.fromRefract(doc.content);
    return this;
  }

  fromCompactRefract(tuple) {
    super.fromCompactRefract(tuple);
    this.content = registry.fromCompactRefract(tuple[3]);
    return this;
  }
}

export class Copy extends StringElement {
  constructor(...args) {
    super(...args);
    this.element = 'copy';
  }

  get contentType() {
    return this.attributes.getValue('contentType');
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
    return this.children((item) => item.classes.contains('resourceGroup'));
  }

  get dataStructures() {
    return this.children((item) => item.classes.contains('dataStructures'));
  }

  get scenarios() {
    return this.children((item) => item.classes.contains('scenario'));
  }

  get transitionGroups() {
    return this.children((item) => item.classes.contains('transitions'));
  }

  get resources() {
    return this.children((item) => item.element === 'resource');
  }

  get transitions() {
    return this.children((item) => item.element === 'transition');
  }

  get copy() {
    return this.children((item) => item.element === 'copy');
  }
}

// Register the API description element Elements.
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
