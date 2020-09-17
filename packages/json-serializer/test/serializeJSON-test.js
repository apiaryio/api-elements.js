const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const serializeJSON = require('../lib/serializeJSON');

const { minim: namespace } = new Fury();

describe('#serializeJSON', () => {
  it('can serialize a primitive element with value', () => {
    const element = new namespace.elements.String('hello world');

    expect(serializeJSON(element)).to.equal('"hello world"');
  });

  it('can serialize a primitive element with default value', () => {
    const element = new namespace.elements.String();
    element.attributes.set('default', 'hello world');

    expect(serializeJSON(element)).to.equal('"hello world"');
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

    expect(serializeJSON(element)).to.equal('"hello world"');
  });

  it('can serialize a dataStructure element', () => {
    const element = new namespace.elements.DataStructure(
      new namespace.elements.Object({ message: 'hello world' })
    );

    expect(serializeJSON(element)).to.equal('{\n  "message": "hello world"\n}');
  });

  it('can serialize an object element with references', () => {
    const include = new namespace.elements.Element();
    include.element = 'ref';
    include.content = 'delivered';

    const element = new namespace.elements.Object([
      new namespace.elements.Member('message', 'hello world'),
      include,
    ]);

    new namespace.elements.Category([
      new namespace.elements.Object({
        status: 'pending',
      }, { id: 'delivered' }),
      element,
    ]).freeze();

    expect(serializeJSON(element)).to.equal('{\n  "message": "hello world",\n  "status": "pending"\n}');
  });
});
