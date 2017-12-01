import { expect } from 'chai';

import minim from 'minim';
import apiDescription from '../src/api-description';

const namespace = minim.namespace().use(apiDescription);

const EnumElement = namespace.getElementClass('enum');
const ArrayElement = namespace.getElementClass('array');
const StringElement = namespace.getElementClass('string');
const NullElement = namespace.getElementClass('null');

describe('Enum Element', () => {
  context('when creating it with undefined content', () => {
    let element;

    before(() => {
      element = new EnumElement();
    });

    it('does not set the content', () => {
      expect(element.content).to.equal(null);
      expect(element.toValue()).to.equal(null);
    });
  });

  context('when creating it with null content', () => {
    let element;

    before(() => {
      element = new EnumElement(null);
    });

    it('does not set the content', () => {
      expect(element.content).to.be.instanceof(NullElement);
      expect(element.toValue()).to.equal(null);
    });
  });

  context('when creating it with string content', () => {
    let element;

    before(() => {
      element = new EnumElement('foo');
    });

    it('sets the content to string element', () => {
      expect(element.content).to.be.instanceof(StringElement);
      expect(element.toValue()).to.equal('foo');
    });
  });

  context('when setting enumerations with array', () => {
    let element;

    before(() => {
      element = new EnumElement('foo');
      element.enumerations = ['foo', 'bar'];
    });

    it('sets the correct attributes', () => {
      expect(element.attributes.get('enumerations')).to.be.instanceof(ArrayElement);
      expect(element.attributes.get('enumerations').toValue()).to.deep.equal(['foo', 'bar']);
    });

    it('provides convenience method', () => {
      expect(element.enumerations).to.be.instanceof(ArrayElement);
      expect(element.enumerations.toValue()).to.deep.equal(['foo', 'bar']);
    });
  });

  context('when setting enumerations with array element', () => {
    let element;

    before(() => {
      element = new EnumElement('foo');
      element.enumerations = new ArrayElement(['foo', 'bar']);
    });

    it('sets the correct attributes', () => {
      expect(element.attributes.get('enumerations')).to.be.instanceof(ArrayElement);
      expect(element.attributes.get('enumerations').toValue()).to.deep.equal(['foo', 'bar']);
    });

    it('provides convenience method', () => {
      expect(element.enumerations).to.be.instanceof(ArrayElement);
      expect(element.enumerations.toValue()).to.deep.equal(['foo', 'bar']);
    });
  });

  context('when setting enumerations with object', () => {
    let element;

    before(() => {
      element = new EnumElement('foo');
      element.enumerations = { foo: 'bar' };
    });

    it('sets the correct attributes', () => {
      expect(element.attributes.get('enumerations')).to.be.instanceof(ArrayElement);
      expect(element.attributes.get('enumerations').toValue()).to.deep.equal([]);
    });

    it('provides convenience method', () => {
      expect(element.enumerations).to.be.instanceof(ArrayElement);
      expect(element.enumerations.toValue()).to.deep.equal([]);
    });
  });
});
