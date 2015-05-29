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
  ArrayType, attributeElementKeys, ElementType, ObjectType, StringType,
  registry
} from 'minim';
import {filterBy} from './util';

/*
 * A base element which provides some conveniences for all API-related
 * elements.
 */
class ApiBaseArray extends ArrayType {
  get title() {
    return this.meta.title.toValue();
  }

  set title(value) {
    this.meta.title.set(value);
  }

  get description() {
    return this.meta.description.toValue();
  }

  set description(value) {
    this.meta.description.set(value);
  }
}

class HttpHeaders extends ApiBaseArray {}
class HrefVariables extends ObjectType {}

export class Asset extends ElementType {
  constructor(...args) {
    super(...args);
    this.element = 'asset';
  }

  get contentType() {
    return this.attributes.contentType;
  }

  set contentType(value) {
    this.attributes.contentType = value;
  }

  get href() {
    return this.attributes.href;
  }

  set href(value) {
    this.attributes.href = value;
  }
}

class HttpMessagePayload extends ApiBaseArray {
  constructor(...args) {
    super(...args);

    this[attributeElementKeys] = ['headers'];
  }

  get headers() {
    return this.attributes.headers;
  }

  set headers(value) {
    this.attributes.headers = value;
  }

  header(name) {
    const header = this.attributes.headers.content.filter(filterBy.bind(this, {
      name,
      ignoreCase: true
    }))[0];
    return header ? header.content : header;
  }

  get dataStructure() {
    return this.filter(item => item.element === 'dataStructure').first();
  }

  get messageBody() {
    // Returns the *first* message body. Only one should be defined according
    // to the spec, but it's possible to include more.
    return this.filter((item) => {
      return item.element === 'asset' && item.meta.class.contains('messageBody');
    }).first();
  }

  get messageBodySchema() {
    // Returns the *first* message body schema. Only one should be defined
    // according to the spec, but it's possible to include more.
    return this.filter((item) => {
      return item.element === 'asset' && item.meta.class.contains('messageBodySchema');
    }).first();
  }
}

export class HttpRequest extends HttpMessagePayload {
  constructor(...args) {
    super(...args);
    this.element = 'httpRequest';
  }

  get method() {
    return this.attributes.method;
  }

  set method(value) {
    this.attributes.method = value;
  }

  get href() {
    return this.attributes.href;
  }

  set href(value) {
    this.attributes.href = value;
  }
}

export class HttpResponse extends HttpMessagePayload {
  get statusCode() {
    return this.attributes.statusCode;
  }

  set statusCode(value) {
    this.attributes.statusCode = value;
  }
}

export class HttpTransaction extends ApiBaseArray {
  constructor(...args) {
    super(...args);
    this.element = 'httpTransaction';
  }

  get request() {
    return this.filter(item => item.element === 'httpRequest').first();
  }

  get response() {
    return this.filter(item => item.element === 'httpResponse').first();
  }
}

export class Transition extends ApiBaseArray {
  constructor(...args) {
    super(...args);

    this.element = 'transition';
    this[attributeElementKeys] = ['parameters', 'attributes'];
  }

  get relation() {
    return this.attributes.relation;
  }

  set relation(value) {
    this.attributes.relation = value;
  }

  get href() {
    return this.attributes.href;
  }

  set href(value) {
    this.attributes.href = value;
  }

  get parameters() {
    return this.attributes.parameters;
  }

  set parameters(value) {
    this.attributes.parameters = value;
  }

  // The key `attributes` is already taken, so `attr` is used instead.
  get attr() {
    return this.attributes.attributes;
  }

  set attr(value) {
    this.attributes.attributes = value;
  }

  get transactions() {
    return this.filter(item => item.element === 'httpTransaction');
  }
}

export class Resource extends ApiBaseArray {
  constructor(...args) {
    super(...args);

    this.element = 'resource';
    this[attributeElementKeys] = ['hrefVariables'];
  }

  get href() {
    return this.attributes.href;
  }

  set href(value) {
    this.attributes.href = value;
  }

  get hrefVariables() {
    return this.attributes.hrefVariables;
  }

  set hrefVariables(value) {
    this.attributes.hrefVariables = value;
  }

  get transitions() {
    return this.filter(item => item.element === 'transition');
  }

  get dataStructure() {
    return this.filter(item => item.element === 'dataStructure').first();
  }
}

export class DataStructure extends ObjectType {
  constructor(...args) {
    super(...args);
    this.element = 'dataStructure';
  }
}

export class Copy extends StringType {
  constructor(...args) {
    super(...args);
    this.element = 'copy';
  }

  get contentType() {
    return this.attributes.contentType;
  }

  set contentType(value) {
    this.attributes.contentType = value;
  }
}

export class Category extends ApiBaseArray {
  constructor(...args) {
    super(...args);
    this.element = 'category';
  }

  get resourceGroups() {
    return this.filter(item => item.meta.class.contains('resourceGroup'));
  }

  get dataStructures() {
    return this.filter(item => item.meta.class.contains('dataStructures'));
  }

  get scenarios() {
    return this.filter(item => item.meta.class.contains('scenario'));
  }

  get resources() {
    return this.filter(item => item.element === 'resource');
  }

  get copy() {
    return this.filter(item => item.element === 'copy');
  }
}

// Register the API and Resource element types.
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
  .register('httpResponse', HttpResponse);
