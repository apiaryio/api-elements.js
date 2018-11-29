const { expect } = require('chai');
const apiElements = require('../lib/api-elements');

describe('API Elements', () => {
  context('provides a default namespace', () => {
    let namespace;

    before(() => {
      namespace = apiElements;
    });

    context('which provides elements', () => {
      it('contains ParseResult', () => {
        expect(namespace.elements.ParseResult).to.not.be.null;
      });

      it('contains Category', () => {
        expect(namespace.elements.Category).to.not.be.null;
      });
    });
  });

  context('provides a namespace class', () => {
    let namespace;

    before(() => {
      namespace = new apiElements.Namespace();
    });

    context('which provides elements', () => {
      it('contains ParseResult', () => {
        expect(namespace.elements.ParseResult).to.not.be.null;
      });

      it('contains Category', () => {
        expect(namespace.elements.Category).to.not.be.null;
      });
    });
  });
});
