const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../../lib/parser/oas/parseResponsesObject');

const { minim: namespace } = new Fury();

describe('Responses Object', () => {
  it('provides warning when responses is non-object', () => {
    const responses = new namespace.elements.String('');
    const result = parse(namespace, responses);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Responses Object' is not an object");
  });

  it('does not provide warning/errors for extensions', () => {
    const responses = new namespace.elements.Object({
      'x-extension': '',
    });

    const result = parse(namespace, responses);

    expect(result).to.not.contain.annotations;
  });

  it('provides warning for invalid keys', () => {
    const responses = new namespace.elements.Object({
      invalid: '',
    });

    const result = parse(namespace, responses);

    expect(result).to.contain.warning("'Responses Object' contains invalid key 'invalid'");
  });

  it('provides warning for response range', () => {
    const responses = new namespace.elements.Object({
      invalid: '',
    });

    const result = parse(namespace, responses);

    expect(result).to.contain.warning("'Responses Object' contains invalid key 'invalid'");
  });

  it('can parse a numerical status code', () => {
    const responses = new namespace.elements.Object({
      200: {},
    });

    const result = parse(namespace, responses);
    expect(result.length).to.equal(1);

    const array = result.get(0);
    expect(array).to.be.instanceof(namespace.elements.Array);
    expect(array.length).to.equal(1);

    const response = array.get(0);
    expect(response).to.be.instanceof(namespace.elements.HttpResponse);
    expect(response.statusCode.toValue()).to.equal(200);
  });

  it('parses default response as warning', () => {
    const responses = new namespace.elements.Object({
      default: {},
    });

    const result = parse(namespace, responses);
    expect(result).to.contain.warning("'Response Object' default responses unsupported");
  });

  it('parses a status code range as warning', () => {
    const responses = new namespace.elements.Object({
      '2XX': {},
    });

    const result = parse(namespace, responses);
    expect(result).to.contain.warning("'Response Object' response status code ranges are unsupported");
  });
});