const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseResponsesObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Responses Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when responses is non-object', () => {
    const responses = new namespace.elements.String('');
    const parseResult = parse(context, responses);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Responses Object' is not an object");
  });

  it('does not provide warning/errors for extensions', () => {
    const responses = new namespace.elements.Object({
      'x-extension': '',
    });

    const parseResult = parse(context, responses);

    expect(parseResult).to.not.contain.annotations;
  });

  it('provides warning for invalid keys', () => {
    const responses = new namespace.elements.Object({
      invalid: '',
    });

    const parseResult = parse(context, responses);

    expect(parseResult).to.contain.warning("'Responses Object' contains invalid key 'invalid'");
  });

  it('provides warning for response range', () => {
    const responses = new namespace.elements.Object({
      invalid: '',
    });

    const parseResult = parse(context, responses);

    expect(parseResult).to.contain.warning("'Responses Object' contains invalid key 'invalid'");
  });

  it('can parse a numerical status code', () => {
    const responses = new namespace.elements.Object({
      200: {
        description: 'dummy',
      },
    });

    const parseResult = parse(context, responses);
    expect(parseResult.length).to.equal(1);

    const array = parseResult.get(0);
    expect(array).to.be.instanceof(namespace.elements.Array);
    expect(array.length).to.equal(1);

    const response = array.get(0);
    expect(response).to.be.instanceof(namespace.elements.HttpResponse);
    expect(response.statusCode.toValue()).to.equal('200');
  });

  it('parses default response as warning', () => {
    const responses = new namespace.elements.Object({
      default: {},
    });

    const parseResult = parse(context, responses);
    expect(parseResult).to.contain.warning("'Responses Object' default responses are unsupported");
  });

  it('parses a status code range as warning', () => {
    const responses = new namespace.elements.Object({
      '2XX': {},
    });

    const parseResult = parse(context, responses);
    expect(parseResult).to.contain.warning("'Responses Object' response status code ranges are unsupported");
  });
});
