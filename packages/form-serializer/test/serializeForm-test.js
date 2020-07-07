const { Fury } = require('@apielements/core');
const { expect } = require('chai');
const serializeForm = require('../lib/serializeForm.js');

const { minim: namespace } = new Fury();

describe('#serializeForm', () => {
  it('can serialize a primitive element with value', () => {
    const element = new namespace.elements.String('Hello world');

    expect(serializeForm({ api: element })).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
  });

  it('can serialize a primitive element with a default value', () => {
    const element = new namespace.elements.String();
    element.attributes.set('default', 'Hello world');

    expect(serializeForm({ api: element })).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
  });

  it('can serialize an element with references via parent tree', () => {
    const element = new namespace.elements.Element();
    element.element = 'message';

    new namespace.elements.Category([
      new namespace.elements.Category([
        new namespace.elements.String('Hello world', { id: 'message' }),
      ], { classes: ['dataStructures'] }),
      element,
    ]).freeze();

    expect(serializeForm({ api: element })).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
  });
});
