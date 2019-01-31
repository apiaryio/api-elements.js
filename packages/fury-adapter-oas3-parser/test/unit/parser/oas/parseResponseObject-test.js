const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseResponseObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Response Object', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('returns an HTTP response element', () => {
    const response = new namespace.elements.Object({
      description: 'response',
    });
    const parseResult = parse(context, response);

    expect(parseResult.length).to.equal(1);
    const httpResponse = parseResult.get(0);
    expect(httpResponse).to.be.instanceof(namespace.elements.HttpResponse);
  });

  describe('#description', () => {
    it('exposes description of response', () => {
      const response = new namespace.elements.Object({
        description: 'Example Response',
      });

      const parseResult = parse(context, response);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.not.contain.annotations;
      expect(parseResult.get(0).copy.toValue()).to.deep.equal(['Example Response']);
    });

    it('does not accept description if not string', () => {
      const response = new namespace.elements.Object({
        description: [],
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.contain.warning("'Response Object' 'description' is not a string");
    });

    it('provide warning if description is missing', () => {
      const response = new namespace.elements.Object({
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.contain.error("'Response Object' is missing required property 'description'");
    });
  });

  it('provides warning when response is non-object', () => {
    const response = new namespace.elements.Member('200', null);

    const parseResult = parse(context, response);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.warning("'Response Object' is not an object");
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported headers key', () => {
      const response = new namespace.elements.Object({
        description: 'response 200',
        headers: 'dummy',
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.contain.warning("'Response Object' contains unsupported key 'headers'");
    });

    it('provides warning for unsupported links key', () => {
      const response = new namespace.elements.Object({
        description: 'response 200',
        links: 'dummy',
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.contain.warning("'Response Object' contains unsupported key 'links'");
    });

    it('does not provide warning/errors for extensions', () => {
      const response = new namespace.elements.Object({
        description: 'response 200',
        'x-extension': '',
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const response = new namespace.elements.Object({
      description: 'response 200',
      invalid: '',
    });

    const parseResult = parse(context, response);

    expect(parseResult).to.contain.warning("'Response Object' contains invalid key 'invalid'");
  });

  describe('#content', () => {
    it('warns when content is not an object', () => {
      const response = new namespace.elements.Object({
        description: 'response 200',
        content: '',
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.contain.warning("'Response Object' 'content' is not an object");
    });

    it('returns a HTTP response elements matching the media types', () => {
      const response = new namespace.elements.Object({
        description: 'response 200',
        content: {
          'application/json': {},
          'application/hal+json': {},
        },
      });

      const parseResult = parse(context, response);

      expect(parseResult.length).to.equal(2);

      const jsonResponse = parseResult.get(0);
      expect(jsonResponse).to.be.instanceof(namespace.elements.HttpResponse);
      expect(jsonResponse.contentType.toValue()).to.equal('application/json');

      const halResponse = parseResult.get(1);
      expect(halResponse).to.be.instanceof(namespace.elements.HttpResponse);
      expect(halResponse.contentType.toValue()).to.equal('application/hal+json');
    });
  });
});
