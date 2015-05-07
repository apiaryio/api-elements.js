/*
 * A refract element implementation with an extensible type registry.
 */

import _ from 'underscore';

/*
 * A private symbol for subclasses to set key names of attributes which should
 * be converted from refract elements rather than simple types.
 */
export const attributeElementKeys = Symbol('attributeElementKeys');

/*
 * ElementType is the base element from which all other elements are built.
 * It has no specific information about how to handle the content, but is
 * able to convert to and from Refract/Javascript.
 */
export class ElementType {
  constructor(element, meta={}, attributes={}, content=null) {
    this.element = element;
    this.meta = meta;
    this.attributes = attributes;
    this.content = content;

    this[attributeElementKeys] = [];
  }

  toValue() {
    return this.content;
  }

  toRefract(options={}) {
    let attributes = this.convertAttributesToRefract('toRefract');
    let initial = {
      element: this.element,
      meta: this.meta,
      attributes,
      content: this.content
    };
    return _.extend(initial, options);
  }

  toCompactRefract() {
    let attributes = this.convertAttributesToRefract('toCompactRefract');
    return [this.element, this.meta, attributes, this.content];
  }

  /*
   * Some attributes may be elements. This is domain-specific knowledge, so
   * a subclass *MUST* define the attribute element names to convert. This
   * method handles the actual serialization to refract.
   */
  convertAttributesToRefract(functionName) {
    let attributes = {};

    for (let name of this.attributes) {
      if (this[attributeElementKeys].indexOf(name) !== -1) {
        attributes[name] = this.attributes[name][functionName]();
      } else {
        attributes[name] = this.attributes[name];
      }
    }

    return attributes;
  }

  /*
   * Some attributes may be elements. This is domain-specific knowledge, so
   * a subclass *MUST* define the attribute element names to convert. This
   * method handles the actual conversion when loading.
   */
  convertAttributesToElements(conversionFunc) {
    for (let name of this[attributeElementKeys]) {
      if (this.attributes[name]) {
        this.attributes[name] = conversionFunc(this.attributes[name]);
      }
    }
  }

  fromRefract(dom) {
    this.element = dom.element;
    this.meta = dom.meta;
    this.attributes = dom.attributes;
    this.content = dom.content;

    this.convertAttributesToElements(convertFromRefract);

    return this;
  }

  fromCompactRefract(tuple) {
    this.element = tuple[0];
    this.meta = tuple[1];
    this.attributes = tuple[2];
    this.content = tuple[3];

    this.convertAttributesToElements(convertFromCompactRefract);

    return this;
  }

  get() {
    return this.content;
  }

  set(content) {
    this.content = content;
    return this;
  }
}

export class NullType extends ElementType {
  constructor(meta, attributes) {
    super('null', meta, attributes, null);
  }

  set() {
    return new Error('Cannot set the value of null');
  }
}

export class StringType extends ElementType {
  constructor(meta, attributes, value) {
    super('string', meta, attributes, value);
  }
}

export class NumberType extends ElementType {
  constructor(meta, attributes, value) {
    super('number', meta, attributes, value);
  }
}

export class BooleanType extends ElementType {
  constructor(meta, attributes, value) {
    super('boolean', meta, attributes, value);
  }
}

class Collection extends ElementType {
  get length() {
    return this.content.length;
  }

  toValue() {
    return this.content.map((el) => {
      return el.toValue();
    });
  }

  toRefract() {
    return super.toRefract({content: this.content.map((el) => {
      return el.toRefract();
    })});
  }

  toCompactRefract() {
    let attributes = this.convertAttributesToRefract('toCompactRefract');
    let compactDoms = this.content.map((el) => {
      return el.toCompactRefract();
    });
    return [this.element, this.meta, attributes, compactDoms];
  }

  fromRefract(dom) {
    this.element = dom.element;
    this.meta = dom.meta;
    this.attributes = dom.attributes;
    this.content = (dom.content || []).map((content) => {
      return convertFromRefract(content);
    });

    this.convertAttributesToElements(convertFromRefract);

    return this;
  }

  fromCompactRefract(tuple) {
    this.element = tuple[0];
    this.meta = tuple[1];
    this.attributes = tuple[2];
    this.content = (tuple[3] || []).map((content) => {
      return convertFromCompactRefract(content);
    });

    this.convertAttributesToElements(convertFromCompactRefract);

    return this;
  }

  get(index) {
    return index === undefined ? this : this.content[index];
  }

  set(index, value) {
    this.content[index] = value;
    return this;
  }

  map(cb) {
    return this.content.map(cb);
  }

  filter(condition) {
    let newArray = new Collection();
    newArray.content = this.content.filter(condition);
    return newArray;
  }

  forEach(cb) {
    this.content.forEach(cb);
  }

  push(value) {
    this.content.push(value);
    return this;
  }

  add(value) {
    this.push(value);
  }

  findElements(condition, results=[]) {
    this.content.forEach((el) => {
      switch (el.element) {
        case 'object': case 'array':
          el.findElements(condition, results);
      }
      if (condition(el)) {
        results.push(el);
      }
    });
    return results;
  }

  find(condition) {
    let newArray = new Collection();
    newArray.content = this.findElements(condition);
    return newArray;
  }
}

export class ArrayType extends Collection {
  constructor(meta={}, attributes={}, values=[]) {
    let content = values.map((value) => {
      return convertToType(value);
    });

    super('array', meta, attributes, content);
  }
}

export class ObjectType extends Collection {
  constructor(meta={}, attributes={}, value={}) {
    super('object', meta, attributes, value);
  }

  toValue() {
    return this.content.reduce((results, el) => {
      results[el.attributes.name] = el.toValue();
      return results;
    }, {});
  }

  get(name) {
    return name === undefined ? this : _.first(
      this.content.filter((value) => {
        return value.attributes.name === name;
      })
    );
  }

  set(name, value) {
    let item = this.content.filter((v) => {
      return v.attributes.name === name;
    })[0];

    // TODO: Make it clear whether we expect refracted input?
    if (item) {
      item.content = value;
    } else {
      // TODO: Should we mutate or copy?
      value.meta.name = name;
      this.content.push(value);
    }

    return this;
  }

  keys() {
    return this.content.map((value) => {
      return value.meta.name;
    });
  }

  values() {
    return this.content.map((value) => {
      return value.get();
    });
  }
}

/*
 * The type registry allows you to register your own classes to be instantiated
 * when a particular refract element is encountered, and allows you to specify
 * which elements get instantiated for existing Javascript objects.
 */
export const TypeRegistry = {
  // A mapping of element name => type class used when loading from refract.
  elementMap: {
    'null': NullType,
    'string': StringType,
    'number': NumberType,
    'boolean': BooleanType,
    'array': ArrayType,
    'object': ObjectType
  },
  // How to convert existing Javascript variables into refract types.
  typeDetection: [
    [_.isNull, NullType],
    [_.isString, StringType],
    [_.isNumber, NumberType],
    [_.isBoolean, BooleanType],
    [_.isArray, ArrayType],
    [_.isObject, ObjectType]
  ]
};

/*
 * Convert an existing Javascript object into refract type instances, which
 * can be further processed or serialized into refract or compact refract.
 */
export function convertToType(value) {
  let element;

  for (let [test, ElementClass] of TypeRegistry.typeDetection) {
    if (test(value)) {
      element = new ElementClass({}, {}, value);
      break;
    }
  }

  return element;
}

function getElementClass(element) {
  let ElementClass = TypeRegistry.elementMap[element];

  if (ElementClass === undefined) {
    // Fall back to the base element. We may not know what
    // to do with the `content`, but downstream software
    // may know.
    ElementClass = ElementType;
  }

  return ElementClass;
}

/*
 * Convert a long-form refract DOM into refract type instances. This uses
 * the type registry above.
 */
export function convertFromRefract(dom) {
  let ElementClass = getElementClass(dom.element);
  return new ElementClass().fromRefract(dom);
}

/*
 * Convert a compact refract tuple into refract type instances. This uses
 * the type registry above.
 */
export function convertFromCompactRefract(tuple) {
  let ElementClass = getElementClass(tuple[0]);
  return new ElementClass().fromCompactRefract(tuple);
}
