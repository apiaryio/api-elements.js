const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseParameterObjects');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Parameter Objects', () => {
  it('provides warning when parameter is non-array', () => {
    const parameters = new namespace.elements.String();

    const result = parse(new Context(namespace), 'Operation Object', parameters);

    expect(result).to.contain.warning("'Operation Object' 'parameters' is not an array");
  });

  it('can parse parameters into groups', () => {
    const parameters = new namespace.elements.Array([
      {
        name: 'id',
        in: 'path',
      },
      {
        name: 'slug',
        in: 'path',
      },
      {
        name: 'tags',
        in: 'query',
      },
    ]);

    const result = parse(new Context(namespace), 'Operation Object', parameters);

    expect(result.length).to.equal(1);
    const parametersElement = result.get(0);
    expect(parametersElement).to.be.instanceof(namespace.elements.Object);

    const pathParameters = parametersElement.get('path');
    expect(pathParameters).to.be.instanceof(namespace.elements.HrefVariables);
    expect(pathParameters.length).to.equal(2);
    expect(pathParameters.content[0].key.toValue()).to.equal('id');
    expect(pathParameters.content[1].key.toValue()).to.equal('slug');

    const queryParameters = parametersElement.get('query');
    expect(queryParameters).to.be.instanceof(namespace.elements.HrefVariables);
    expect(queryParameters.length).to.equal(1);
    expect(queryParameters.content[0].key.toValue()).to.equal('tags');
  });
});
