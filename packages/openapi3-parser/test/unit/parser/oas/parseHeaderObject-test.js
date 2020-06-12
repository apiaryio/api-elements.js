const { Fury } = require('@apielements/core');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseHeaderObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Header Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('is parsed into StringElement', () => {
    const header = new namespace.elements.Object({});

    const result = parse(context, header);

    expect(result).to.not.contain.annotations;
    expect(result.length).to.equal(1);
    expect(result.get(0)).to.be.instanceof(namespace.elements.String);
  });

  it('provides warning when header is non-object', () => {
    const header = new namespace.elements.String();

    const result = parse(context, header);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Header Object' is not an object");
  });

  describe('disallow specific keys', () => {
    it('#name', () => {
      const header = new namespace.elements.Object({
        name: 'dummy',
      });

      const result = parse(context, header);

      expect(result).to.contain.warning("'Header Object' contains invalid key 'name'");
    });

    it('#in', () => {
      const header = new namespace.elements.Object({
        in: 'dummy',
      });

      const result = parse(context, header);

      expect(result).to.contain.warning("'Header Object' contains invalid key 'in'");
    });
  });

  describe('report unsupported keys', () => {
    it('#description', () => {
      const header = new namespace.elements.Object({
        description: 'dummy',
      });

      const result = parse(context, header);

      expect(result).to.contain.warning("'Header Object' contains unsupported key 'description'");
    });
  });
});
