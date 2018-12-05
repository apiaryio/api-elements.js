const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseParameterObjects');

const { minim } = new Fury();

describe('Parameter Objects', () => {
  it('provides warning when parameter is non-array', () => {
    const parameters = new minim.elements.String();

    const result = parse(minim, 'Operation Object', parameters);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Operation Object' 'parameters' is not an array"
    );
  });

  it('can parse parameters into groups', () => {
    const parameters = new minim.elements.Array([
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

    const result = parse(minim, 'Operation Object', parameters);

    expect(result.length).to.equal(1);
    const parametersElement = result.get(0);
    expect(parametersElement).to.be.instanceof(minim.elements.Object);

    const pathParameters = parametersElement.get('path');
    expect(pathParameters).to.be.instanceof(minim.elements.HrefVariables);
    expect(pathParameters.length).to.equal(2);
    expect(pathParameters.content[0].key.toValue()).to.equal('id');
    expect(pathParameters.content[1].key.toValue()).to.equal('slug');

    const queryParameters = parametersElement.get('query');
    expect(queryParameters).to.be.instanceof(minim.elements.HrefVariables);
    expect(queryParameters.length).to.equal(1);
    expect(queryParameters.content[0].key.toValue()).to.equal('tags');
  });
});
