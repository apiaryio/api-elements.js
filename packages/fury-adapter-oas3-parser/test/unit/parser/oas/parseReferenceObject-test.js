const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseReferenceObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Reference Object', () => {
  let context;
  let dataStructure;

  beforeEach(() => {
    context = new Context(namespace);

    dataStructure = new namespace.elements.DataStructure();
    dataStructure.id = 'Node';

    context.state.components = new namespace.elements.Object({
      schemas: {
        Node: dataStructure,
      },
    });
  });


  it('errors when parsing non-string $ref', () => {
    const reference = new namespace.elements.Object({
      $ref: true,
    });
    const result = parse(context, 'schemas', reference);

    expect(result).to.contain.error("'Reference Object' '$ref' is not a string");
  });

  it('can parse a reference', () => {
    const reference = new namespace.elements.Object({
      $ref: '#/components/schemas/Node',
    });
    const result = parse(context, 'schemas', reference);

    expect(result.length).to.equal(1);
    const structure = result.get(0);
    expect(structure).to.equal(dataStructure);
  });

  it('can parse a reference to a component that could not be parsed', () => {
    context.state.components = new namespace.elements.Object({
      schemas: {
        Node: undefined,
      },
    });

    const reference = new namespace.elements.Object({
      $ref: '#/components/schemas/Node',
    });
    const result = parse(context, 'schemas', reference);

    expect(result.length).to.equal(0);
  });

  describe('invalid references', () => {
    it('errors when parsing a non-components reference', () => {
      const reference = new namespace.elements.Object({
        $ref: '#/info/title',
      });
      const result = parse(context, 'schemas', reference);

      expect(result).to.contain.error("Only local references to '#/components' within the same file are supported");
    });

    it('errors when parsing reference to a nonexistent component', () => {
      const reference = new namespace.elements.Object({
        $ref: '#/components/parameters/Node',
      });
      const result = parse(context, 'parameters', reference);

      expect(result).to.contain.error("'#/components/parameters' is not defined");
    });

    it('errors when parsing reference to incorrect component name', () => {
      const reference = new namespace.elements.Object({
        $ref: '#/components/parameters/Node',
      });
      const result = parse(context, 'schemas', reference);

      expect(result).to.contain.error("Only references to 'schemas' are permitted from this location");
    });

    it('errors when parsing reference to nonexistent property in component', () => {
      const reference = new namespace.elements.Object({
        $ref: '#/components/schemas/BaseNode',
      });
      const result = parse(context, 'schemas', reference);

      expect(result).to.contain.error("'#/components/schemas/BaseNode' is not defined");
    });

    it('errors when parsing reference thats too deep', () => {
      const reference = new namespace.elements.Object({
        $ref: '#/components/schemas/Node/inside',
      });
      const result = parse(context, 'schemas', reference);

      expect(result).to.contain.error(
        "Only references to a reusable component inside '#/components/schemas' are supported"
      );
    });

    it('errors when parsing reference to nonexistent components', () => {
      context.state.components = undefined;
      const reference = new namespace.elements.Object({
        $ref: '#/components/schemas/Node',
      });
      const result = parse(context, 'schemas', reference);

      expect(result).to.contain.error("'#/components' is not defined");
    });
  });

  describe('warnings for invalid properties', () => {
    it('provides warning for invalid keys', () => {
      const reference = new namespace.elements.Object({
        $ref: '#/components/schemas/Node',
        invalid: {},
      });

      const result = parse(context, 'schemas', reference);

      expect(result).to.contain.warning("'Reference Object' contains invalid key 'invalid'");
    });

    it('provides warning for extensions', () => {
      const reference = new namespace.elements.Object({
        $ref: '#/components/schemas/Node',
        'x-extension': {},
      });

      const result = parse(context, 'schemas', reference);

      expect(result).to.contain.warning("Extensions are not permitted in 'Reference Object'");
    });
  });
});
