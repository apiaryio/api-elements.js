const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseSchemaObject');

const { minim } = new Fury();

describe('Schema Object', () => {
  it('provides a warning when schema is non-object', () => {
    const schema = new minim.elements.Member('User', 'my schema');
    const result = parse(minim, schema);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'Schema Object' is not an object");
  });

  it('returns an unsupported warning', () => {
    const schema = new minim.elements.Member('User', {});
    const result = parse(minim, schema);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Schema Object' is unsupported"
    );
  });
});
