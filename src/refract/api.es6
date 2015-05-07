/*
 * API-specific refract elements. General structure:
 *
 * + Category - API, resource group
 *   + Category
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

import {attributeElementKeys, ElementType, ArrayType, ObjectType, TypeRegistry} from './primitives';
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

  get dataStructure() {
    return this.findElements(filterBy.bind(this, {
      element: 'dataStructure'
    }))[0];
  }

  get messageBody() {
    // Returns the *first* message body. Only one should be defined according
    // to the spec, but it's possible to include more.
    return this.findElements(filterBy.bind(this, {
      element: 'asset',
      className: 'messageBody'
    }))[0];
  }

  get messageBodySchema() {
    // Returns the *first* message body schema. Only one should be defined
    // according to the spec, but it's possible to include more.
    return this.findElements(filterBy.bind(this, {
      element: 'asset',
      className: 'messageBodySchema'
    }))[0];
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
    return this.findElements(filterBy.bind(this, {
      element: 'httpRequest'
    }))[0];
  }

  get response() {
    return this.findElements(filterBy.bind(this, {
      element: 'httpResponse'
    }))[0];
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

  // TODO: Name is already taken... hmm.
  // get attributes() {
  //   return this.attributes.attributes;
  // }
  //
  // set attributes(value) {
  //   this.attributes.attributes = value;
  // }

  get transactions() {
    return this.findElements(filterBy.bind(this, {
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
    return this.findElements(filterBy.bind(this, {
      element: 'transition'
    }));
  }

  get dataStructure() {
    return this.findElements(filterBy.bind(this, {
      element: 'dataStructure'
    }))[0];
  }
}

export class DataStructure extends ObjectType {}

export class Category extends ApiBaseArray {
  get resourceGroups() {
    return this.findElements(filterBy.bind(this, {
      className: 'resourceGroup'
    }));
  }

  get dataStructures() {
    return this.findElements(filterBy.bind(this, {
      element: 'dataStructure'
    }));
  }

  get resources() {
    return this.findElements(filterBy.bind(this, {
      element: 'resource'
    }));
  }
}

TypeRegistry.elementMap.category = Category;
TypeRegistry.elementMap.resource = Resource;
TypeRegistry.elementMap.transition = Transition;
TypeRegistry.elementMap.httpTransaction = HttpTransaction;
TypeRegistry.elementMap.httpHeaders = HttpHeaders;
TypeRegistry.elementMap.hrefVariables = HrefVariables;
TypeRegistry.elementMap.asset = Asset;
TypeRegistry.elementMap.httpRequest = HttpRequest;
TypeRegistry.elementMap.httpResponse = HttpResponse;
