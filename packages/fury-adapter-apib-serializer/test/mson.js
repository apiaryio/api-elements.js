const { expect } = require('chai');
const { Fury } = require('fury');
const { renderAttributes } = require('../lib/mson');

const fury = new Fury();
const elements = fury.minim.elements;
const {
  DataStructure,
  Array: ArrayElement,
  Object: ObjectElement, Member,
} = elements;

describe('Rendering Attributes', () => {
  it('can render an array', () => {
    const dataStructure = new DataStructure(new ArrayElement(['one', 'two']));
    expect(renderAttributes(dataStructure)).to.equal('+ Attributes (array)\n\n    + one\n    + two\n');
  });

  it('can render an object', () => {
    const object = new ObjectElement({ name: 'Doe' });
    const dataStructure = new DataStructure(object);

    expect(renderAttributes(dataStructure)).to.equal('+ Attributes\n\n    + name: Doe\n');
  });

  it('can render an object with valueless key', () => {
    const object = new ObjectElement();
    object.push(new Member('name'));
    const dataStructure = new DataStructure(object);

    expect(renderAttributes(dataStructure)).to.equal('+ Attributes\n\n    + name\n');
  });

  it('can render an object with key', () => {
    const object = new ObjectElement();
    object.push(new Member('name'));
    const dataStructure = new DataStructure(object);

    expect(renderAttributes(dataStructure)).to.equal('+ Attributes\n\n    + name\n');
  });
});
