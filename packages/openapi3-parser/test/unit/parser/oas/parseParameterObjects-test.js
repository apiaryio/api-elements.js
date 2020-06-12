const { Fury } = require('@apielements/core');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseParameterObjects');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Parameter Objects', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when parameter is non-array', () => {
    const parameters = new namespace.elements.String();

    const parseResult = parse(context, 'Operation Object', parameters);

    expect(parseResult).to.contain.warning("'Operation Object' 'parameters' is not an array");
  });

  it('can parse parameters into groups', () => {
    const parameters = new namespace.elements.Array([
      {
        name: 'id',
        in: 'path',
        required: true,
      },
      {
        name: 'slug',
        in: 'path',
        required: true,
      },
      {
        name: 'tags',
        in: 'query',
      },
    ]);

    const parseResult = parse(context, 'Operation Object', parameters);

    expect(parseResult.length).to.equal(1);
    const parametersElement = parseResult.get(0);
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

  it('can parse reference parameters', () => {
    const parameters = new namespace.elements.Array([
      {
        $ref: '#/components/parameters/tags',
      },
    ]);

    const tags = new namespace.elements.Member('tags');
    tags.in = 'query';

    context.state.components = new namespace.elements.Object({
      parameters: { tags },
    });

    const parseResult = parse(context, 'Operation Object', parameters);

    expect(parseResult.length).to.equal(1);
    const parametersElement = parseResult.get(0);
    expect(parametersElement).to.be.instanceof(namespace.elements.Object);

    const queryParameters = parametersElement.get('query');
    expect(queryParameters).to.be.instanceof(namespace.elements.HrefVariables);
    expect(queryParameters.length).to.equal(1);
    expect(queryParameters.content[0].key.toValue()).to.equal('tags');
  });
});
