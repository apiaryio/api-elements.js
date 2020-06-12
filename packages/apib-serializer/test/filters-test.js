const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const { bodyOnly } = require('../lib/filters');

const fury = new Fury();
const { minim: namespace } = fury;

describe('filters', () => {
  describe('bodyOnly', () => {
    it('returns false when message payload is empty', () => {
      const payload = new namespace.elements.HttpRequest();

      expect(bodyOnly(payload)).to.be.false;
    });

    it('returns true when message payload only contains a body', () => {
      const asset = new namespace.elements.Asset();
      asset.classes = ['messageBody'];
      const payload = new namespace.elements.HttpRequest([asset]);

      expect(bodyOnly(payload)).to.be.true;
    });

    it('returns false when message payload contains a body and other elements', () => {
      const copy = new namespace.elements.Copy('Hello World');

      const asset = new namespace.elements.Asset();
      asset.classes = ['messageBody'];
      const payload = new namespace.elements.HttpRequest([copy, asset]);

      expect(bodyOnly(payload)).to.be.false;
    });

    it('returns true when message payload only contains a body and headers', () => {
      const payload = new namespace.elements.HttpRequest();
      payload.headers = new namespace.elements.HttpHeaders({
        Accept: 'application/json',
      });

      expect(bodyOnly(payload)).to.be.false;
    });

    it('returns true when message payload only contains a body and a single Content-Type header', () => {
      const asset = new namespace.elements.Asset();
      asset.classes = ['messageBody'];

      const payload = new namespace.elements.HttpRequest([asset]);
      payload.headers = new namespace.elements.HttpHeaders({
        'Content-Type': 'application/json',
      });

      expect(bodyOnly(payload)).to.be.true;
    });
  });
});
