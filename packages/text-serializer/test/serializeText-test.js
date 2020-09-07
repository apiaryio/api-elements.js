const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const serializeText = require('../lib/serializeText');

const { minim: namespace } = new Fury();

describe('#serializeText', () => {
  it('can serialize a primitive element with value', () => {
    const stringElement = new namespace.elements.String('hello world');
    const numberElement = new namespace.elements.Number(1);
    const booleanElement = new namespace.elements.Boolean(true);
    const nullElement = new namespace.elements.Null();

    expect(serializeText(stringElement)).to.equal('hello world');
    expect(serializeText(numberElement)).to.equal('1');
    expect(serializeText(booleanElement)).to.equal('true');
    expect(serializeText(nullElement)).to.equal('null');
  });

  it('can serialize a primitive element with default value', () => {
    const element = new namespace.elements.String();
    element.attributes.set('default', 'hello world');

    expect(serializeText(element)).to.equal('hello world');
  });

  it('can serialize an element with references via parent tree', () => {
    const element = new namespace.elements.Element();
    element.element = 'message';

    new namespace.elements.Category([
      new namespace.elements.Category([
        new namespace.elements.String('hello world', { id: 'message' }),
      ], { classes: ['dataStructures'] }),
      new namespace.elements.Category([
        element,
      ]),
    ]).freeze();

    expect(serializeText(element)).to.equal('hello world');
  });

  it('can serialize a dataStructure element', () => {
    const element = new namespace.elements.DataStructure(
      new namespace.elements.String('hello world')
    );

    expect(serializeText(element)).to.equal('hello world');
  });

  it('errors with a non primitive element', () => {
    const objectElement = new namespace.elements.Object({ message: 'Hello world' });
    const arrayElement = new namespace.elements.Array(['Hello', 'Doe']);
    const emptyEnumElement = new namespace.elements.Enum();

    expect(() => serializeText(objectElement)).to.throw('Only primitive elements can be serialized as text/plain');
    expect(() => serializeText(arrayElement)).to.throw('Only primitive elements can be serialized as text/plain');
    expect(() => serializeText(emptyEnumElement)).to.throw('Only primitive elements can be serialized as text/plain');
  });
});
