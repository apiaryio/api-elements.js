const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const serializeText = require('../lib/serializeText');

const { minim: namespace } = new Fury();

const done = (err, body) => {
  if (err) {
    throw err;
  } else {
    return body;
  }
};

describe('#serializeText', () => {
  it('can serialize a primitive element with value', () => {
    const stringElement = new namespace.elements.String('hello world');
    const numberElement = new namespace.elements.Number(1);
    const booleanElement = new namespace.elements.Boolean(true);
    const nullElement = new namespace.elements.Null();

    expect(serializeText(stringElement, done)).to.equal('hello world');
    expect(serializeText(numberElement, done)).to.equal('1');
    expect(serializeText(booleanElement, done)).to.equal('true');
    expect(serializeText(nullElement, done)).to.equal('null');
  });

  it('can serialize an enum element with primitive values', () => {
    const enumElement = new namespace.elements.Enum();
    enumElement.enumerations = ['north', 'east', 'south', 'west'];

    expect(serializeText(enumElement, done)).to.equal('north');
  });

  it('can serialize a primitive element with default value', () => {
    const element = new namespace.elements.String();
    element.attributes.set('default', 'hello world');

    expect(serializeText(element, done)).to.equal('hello world');
  });

  it('can serialize an element with references via parent tree', () => {
    const element = new namespace.elements.Element();
    element.element = 'error';

    const error = new namespace.elements.Element();
    error.element = 'message';
    error.id = 'error';

    new namespace.elements.Category([
      new namespace.elements.Category([
        new namespace.elements.String('error message', { id: 'message' }),
        error,
      ], { classes: ['dataStructures'] }),
      new namespace.elements.Category([
        element,
      ]),
    ]).freeze();

    expect(serializeText(element, done)).to.equal('error message');
  });

  it('can serialize a dataStructure element', () => {
    const element = new namespace.elements.DataStructure(
      new namespace.elements.String('hello world')
    );

    expect(serializeText(element, done)).to.equal('hello world');
  });

  it('can serialize from referenced element', () => {
    const element = new namespace.elements.Element();
    element.element = 'ref';
    element.content = 'message';

    new namespace.elements.Category([
      new namespace.elements.String('hello world', { id: 'message' }),
      element,
    ]).freeze();

    expect(serializeText(element, done)).to.equal('hello world');
  });

  it('errors with a non primitive element', () => {
    const objectElement = new namespace.elements.Object({ message: 'Hello world' });
    const arrayElement = new namespace.elements.Array(['Hello', 'Doe']);
    const emptyEnumElement = new namespace.elements.Enum();

    expect(() => serializeText(objectElement, done)).to.throw('Only primitive elements can be serialized as text/plain');
    expect(() => serializeText(arrayElement, done)).to.throw('Only primitive elements can be serialized as text/plain');
    expect(() => serializeText(emptyEnumElement, done)).to.throw('Only primitive elements can be serialized as text/plain');
  });
});
