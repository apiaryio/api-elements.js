const { expect } = require('chai');
const { Fury } = require('fury');

const parse = require('../../../../lib/parser/oas/parsePathsObject');

const { minim } = new Fury();

describe('#parsePathsObject', () => {
  it('provides error when paths is non-object', () => {
    const paths = new minim.elements.String();

    const result = parse(minim, paths);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'Paths Object' is not an object");
  });

  it('returns empty parse result when paths is empty', () => {
    const paths = new minim.elements.Object();
    const result = parse(minim, paths);

    expect(result.isEmpty).to.be.true;
  });

  it('provides a warning when paths contains non-path field pattern', () => {
    const paths = new minim.elements.Object({
      test: {},
    });

    const result = parse(minim, paths);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'Paths Object' contains invalid key 'test'");
  });

  it('ignores extension objects', () => {
    const paths = new minim.elements.Object({
      'x-extension': {},
    });

    const result = parse(minim, paths);

    expect(result.isEmpty).to.be.true;
  });

  it('parses multiple path items into resources in defined order', () => {
    const paths = new minim.elements.Object({
      '/3': new minim.elements.Object(),
      '/1': new minim.elements.Object(),
      '/2': new minim.elements.Object(),
    });

    const result = parse(minim, paths);

    expect(result.length).to.equal(3);
    expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
    expect(result.get(0).href.toValue()).to.equal('/3');

    expect(result.get(1)).to.be.instanceof(minim.elements.Resource);
    expect(result.get(1).href.toValue()).to.equal('/1');

    expect(result.get(2)).to.be.instanceof(minim.elements.Resource);
    expect(result.get(2).href.toValue()).to.equal('/2');
  });
});
