const { Fury } = require('fury');
const { expect } = require('chai');
const adapter = require('../lib/adapter');

describe('Multipart/form-data Serializer Adapter', () => {
  let fury;

  before(() => {
    fury = new Fury();
    fury.use(adapter);
  });

  it('has a name', () => {
    expect(adapter.name).to.equal('form');
  });

  it('has a multipart/form-data media type', () => {
    expect(adapter.mediaTypes).to.deep.equal(['multipart/form-data']);
  });

  it('can serialize an object element', (done) => {
    const element = new fury.minim.elements.Object({ message: 'Hello world' });

    fury.serialize({ api: element, mediaType: 'multipart/form-data' }, (error, result) => {
      expect(error).to.be.null;
      expect(result).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="message"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
      done();
    });
  });

  it('can serialize a string element', (done) => {
    const element = new fury.minim.elements.String('Hello world');

    fury.serialize({ api: element, mediaType: 'multipart/form-data' }, (error, result) => {
      expect(error).to.be.null;
      expect(result).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
      done();
    });
  });
});
