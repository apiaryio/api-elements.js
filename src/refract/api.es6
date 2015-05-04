/*
 * API-specific refract elements.
 */

import RefractElement from './element';

class HttpTransaction extends RefractElement {
  get messages() {
    // TODO
  }

  get requests() {
    // TODO
  }

  get responses() {
    // TODO
  }
}

class Transition extends RefractElement {
  constructor(element) {
    super(element);
  }

  get transactions() {
    return this.contents({
      elementName: 'transaction',
      elementType: HttpTransaction
    });
  }
}

class Resource extends RefractElement {
  constructor(element) {
    super(element);
    this.href = element[1].href;
    // TODO: hrefVariables
  }

  get transitions() {
    return this.contents({
      elementName: 'transition',
      elementType: Transition
    });
  }
}

class Category extends RefractElement {}

class ResourceGroup extends Category {
  get resources() {
    return this.contents({
      elementName: 'resource',
      elementType: Resource
    });
  }
}

export default class Api extends Category {
  get resourceGroups() {
    return this.contents({
      className: 'resourceGroup',
      elementType: ResourceGroup
    });
  }

  get dataStructures() {
    return this.contents({className: 'dataStructure'});
  }
}
