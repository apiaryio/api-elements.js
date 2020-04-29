const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseRequestBodyObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Request Body Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('returns an HTTP request element', () => {
    const request = new namespace.elements.Object();
    const parseResult = parse(context, request);

    expect(parseResult.length).to.equal(1);
    const httpRequest = parseResult.get(0);
    expect(httpRequest).to.be.instanceof(namespace.elements.HttpRequest);
  });

  it('provides warning when request body is non-object', () => {
    const request = new namespace.elements.String();

    const parseResult = parse(context, request);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Request Body Object' is not an object");
  });

  describe('#description', () => {
    it('it expose description in content', () => {
      const request = new namespace.elements.Object({
        description: 'Example Request Body',
      });

      const parseResult = parse(context, request);

      expect(parseResult).to.not.contain.annotations;
      expect(parseResult.length).to.be.equal(1);
      expect(parseResult.get(0).copy.toValue()).to.deep.equal(['Example Request Body']);
    });
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported required key', () => {
      const request = new namespace.elements.Object({
        required: true,
      });

      const parseResult = parse(context, request);

      expect(parseResult).to.contain.warning("'Request Body Object' contains unsupported key 'required'");
    });

    it('does not provide warning/errors for extensions', () => {
      const request = new namespace.elements.Object({
        'x-extension': '',
      });

      const parseResult = parse(context, request);

      expect(parseResult).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const request = new namespace.elements.Object({
      invalid: '',
    });

    const parseResult = parse(context, request);

    expect(parseResult).to.contain.warning("'Request Body Object' contains invalid key 'invalid'");
  });

  describe('#content', () => {
    it('warns when content is not an object', () => {
      const response = new namespace.elements.Object({
        content: '',
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.contain.warning("'Request Body Object' 'content' is not an object");
    });

    it('returns a HTTP request elements matching the media types', () => {
      const response = new namespace.elements.Object({
        content: {
          'application/json': {},
          'text/plain': {},
        },
      });

      const parseResult = parse(context, response);

      expect(parseResult.length).to.equal(2);

      const jsonRequest = parseResult.get(0);
      expect(jsonRequest).to.be.instanceof(namespace.elements.HttpRequest);
      expect(jsonRequest.contentType.toValue()).to.equal('application/json');

      const textRequest = parseResult.get(1);
      expect(textRequest).to.be.instanceof(namespace.elements.HttpRequest);
      expect(textRequest.contentType.toValue()).to.equal('text/plain');
    });
  });
});
