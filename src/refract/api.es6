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
    return this.meta.title;
  }

  set title(value) {
    this.meta.title = value;
  }

  get description() {
    return this.meta.description;
  }

  set description(value) {
    this.meta.description = value;
  }
}

class HttpHeaders extends ApiBaseArray {}
class HrefVariables extends ObjectType {}

export class Asset extends ElementType {
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
    return this.children(filterBy.bind(this, {
      element: 'dataStructure'
    })).get(0);
  }

  get messageBody() {
    // Returns the *first* message body. Only one should be defined according
    // to the spec, but it's possible to include more.
    return this.children(filterBy.bind(this, {
      element: 'asset',
      className: 'messageBody'
    })).get(0);
  }

  get messageBodySchema() {
    // Returns the *first* message body schema. Only one should be defined
    // according to the spec, but it's possible to include more.
    return this.children(filterBy.bind(this, {
      element: 'asset',
      className: 'messageBodySchema'
    })).get(0);
  }
}

export class HttpRequest extends HttpMessagePayload {
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
  get request() {
    return this.children(filterBy.bind(this, {
      element: 'httpRequest'
    })).get(0);
  }

  get response() {
    return this.children(filterBy.bind(this, {
      element: 'httpResponse'
    })).get(0);
  }
}

export class Transition extends ApiBaseArray {
  constructor(...args) {
    super(...args);

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
    return this.children(filterBy.bind(this, {
      element: 'httpTransaction'
    }));
  }
}

export class Resource extends ApiBaseArray {
  constructor(...args) {
    super(...args);

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
    return this.children(filterBy.bind(this, {
      element: 'transition'
    }));
  }

  get dataStructure() {
    return this.children(filterBy.bind(this, {
      element: 'dataStructure'
    })).get(0);
  }
}

export class DataStructure extends ObjectType {}

export class Copy extends StringType {
  get contentType() {
    return this.attributes.contentType;
  }

  set contentType(value) {
    this.attributes.contentType = value;
  }
}

export class Category extends ApiBaseArray {
  get resourceGroups() {
    return this.children(filterBy.bind(this, {
      className: 'resourceGroup'
    }));
  }

  get dataStructures() {
    return this.children(filterBy.bind(this, {
      className: 'dataStructures'
    }));
  }

  get scenarios() {
    return this.children(filterBy.bind(this, {
      className: 'scenario'
    }));
  }

  get resources() {
    return this.children(filterBy.bind(this, {
      element: 'resource'
    }));
  }

  get copy() {
    return this.children(filterBy.bind(this, {
      element: 'copy'
    }));
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
