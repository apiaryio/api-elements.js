const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseSchemaObject');

const { minim } = new Fury();

describe('Schema Object', () => {
  it('returns an unsupported warning', () => {
    const schema = new minim.elements.Member('User', {});
    const result = parse(minim, schema);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Schema Object' is unsupported"
    );
  });
});
