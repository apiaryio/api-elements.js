const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseComponentsObject');

const { minim } = new Fury();

describe('Components Object', () => {
  it('returns an unsupported warning', () => {
    const components = new minim.elements.Object();
    const result = parse(minim, components);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Components Object' is unsupported"
    );
  });

  it('provides a warning when components is non-object', () => {
    const components = new minim.elements.String();

    const result = parse(minim, components);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'Components Object' is not an object");
  });
});
