const { Fury } = require('fury');
const { expect } = require('chai');
const serializeForm = require('../lib/serializeForm.js');

const { minim: namespace } = new Fury();

describe('#serializeForm', () => {
  it('can serialize a primitive element with value', () => {
    const element = new namespace.elements.String('Hello world');

    expect(serializeForm({ api: element })).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
  });
});
