const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseExampleObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Example Object', () => {
  let context;

  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides a warning when example is non-object', () => {
    const example = new namespace.elements.String('my example');
    const parseResult = parse(context, example);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Example Object' is not an object");
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported summary key', () => {
      const example = new namespace.elements.Object({
        summary: 'summary',
      });

      const parseResult = parse(context, example);

      expect(parseResult).to.contain.warning("'Example Object' contains unsupported key 'summary'");
    });

    it('provides warning for unsupported description key', () => {
      const example = new namespace.elements.Object({
        description: 'description',
      });

      const parseResult = parse(context, example);

      expect(parseResult).to.contain.warning("'Example Object' contains unsupported key 'description'");
    });

    it('provides warning for unsupported value key', () => {
      const example = new namespace.elements.Object({
        value: 'value',
      });

      const parseResult = parse(context, example);

      expect(parseResult).to.contain.warning("'Example Object' contains unsupported key 'value'");
    });

    it('provides warning for unsupported externalValue key', () => {
      const example = new namespace.elements.Object({
        externalValue: 'externalValue',
      });

      const parseResult = parse(context, example);

      expect(parseResult).to.contain.warning("'Example Object' contains unsupported key 'externalValue'");
    });
  });
});
