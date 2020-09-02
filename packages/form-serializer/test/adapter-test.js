const { Fury } = require('@apielements/core');
const { expect } = require('chai');
const adapter = require('../lib/adapter');

describe('Form Serializer Adapter', () => {
  let fury;

  before(() => {
    fury = new Fury();
    fury.use(adapter);
  });

  describe('Multipart/form-data mediaType', () => {
    it('has a name', () => {
      expect(adapter.name).to.equal('form');
    });

    it('has a multipart/form-data media type', () => {
      expect(adapter.mediaTypes).to.include('multipart/form-data');
    });

    it('can serialize an object element asynchronously', (done) => {
      const element = new fury.minim.elements.Object({ message: 'Hello world' });

      fury.serialize({ api: element, mediaType: 'multipart/form-data' }, (error, result) => {
        expect(error).to.be.null;
        expect(result).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="message"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
        done();
      });
    });

    it('can serialize an object element synchronously', () => {
      const element = new fury.minim.elements.Object({ message: 'Hello world' });
      const result = fury.serializeSync({ api: element, mediaType: 'multipart/form-data' });

      expect(result).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="message"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
    });

    it('can serialize a string element asynchronously', (done) => {
      const element = new fury.minim.elements.String('Hello world');

      fury.serialize({ api: element, mediaType: 'multipart/form-data' }, (error, result) => {
        expect(error).to.be.null;
        expect(result).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
        done();
      });
    });

    it('can serialize a string element synchronously', () => {
      const element = new fury.minim.elements.String('Hello world');
      const result = fury.serializeSync({ api: element, mediaType: 'multipart/form-data' });

      expect(result).to.equal('--BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n');
    });
  });

  describe('Application/x-www-form-urlencoded mediaType', () => {
    it('has a name', () => {
      expect(adapter.name).to.equal('form');
    });

    it('has an application/x-www-form-urlencoded media type', () => {
      expect(adapter.mediaTypes).to.include('application/x-www-form-urlencoded');
    });

    it('can serialize an object element asynchronoulsy', (done) => {
      const element = new fury.minim.elements.Object({ message: 'Hello world' });

      fury.serialize({ api: element, mediaType: 'application/x-www-form-urlencoded' }, (error, result) => {
        expect(error).to.be.null;
        expect(result).to.equal('message=Hello%20world');
        done();
      });
    });

    it('can serialize an object element synchronoulsy', () => {
      const element = new fury.minim.elements.Object({ message: 'Hello world' });
      const result = fury.serializeSync({ api: element, mediaType: 'application/x-www-form-urlencoded' });

      expect(result).to.equal('message=Hello%20world');
    });

    it('can serialize a string element asynchronously', (done) => {
      const element = new fury.minim.elements.String('Hello world');

      fury.serialize({ api: element, mediaType: 'application/x-www-form-urlencoded' }, (error, result) => {
        expect(error).to.be.null;
        expect(result).to.equal('undefined=Hello%20world');
        done();
      });
    });

    it('can serialize a string element synchronously', () => {
      const element = new fury.minim.elements.String('Hello world');
      const result = fury.serializeSync({ api: element, mediaType: 'application/x-www-form-urlencoded' });

      expect(result).to.equal('undefined=Hello%20world');
    });
  });
});
