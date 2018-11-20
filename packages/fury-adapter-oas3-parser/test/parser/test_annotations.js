const { expect } = require('chai');
const { Fury } = require('fury');
const { validateMembers } = require('../../lib/parser/annotations');

const { minim } = new Fury();

describe('#validateMembers', () => {
  it('can transform a member, where transform returns direct member', () => {
    const object = new minim.elements.Object({ name: 'doe' });

    const transform = member => new minim.elements.Member(member.key, member.value.toValue().toUpperCase());

    const parseResult = validateMembers(minim, transform, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0).element).to.equal('object');
    expect(parseResult.get(0).length).to.equal(1);
    expect(parseResult.get(0).get('name').toValue()).to.equal('DOE');
  });

  it('can transform a member, where transform returns value to be wrapped in member', () => {
    const object = new minim.elements.Object({ name: 'doe' });

    const transform = member => member.value.toValue().toUpperCase();

    const parseResult = validateMembers(minim, transform, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0).element).to.equal('object');
    expect(parseResult.get(0).length).to.equal(1);
    expect(parseResult.get(0).get('name').toValue()).to.equal('DOE');
  });

  it('can transform a member, where transform returns a parse result of members', () => {
    const object = new minim.elements.Object({ name: 'doe' });

    const transform = (member) => {
      const newMember = new minim.elements.Member(member.key, member.value.toValue().toUpperCase());
      return new minim.elements.ParseResult([newMember]);
    };

    const parseResult = validateMembers(minim, transform, object);

    expect(parseResult.length).to.equal(1);
    expect(parseResult.get(0).element).to.equal('object');
    expect(parseResult.get(0).length).to.equal(1);
    expect(parseResult.get(0).get('name').toValue()).to.equal('DOE');
  });
});
