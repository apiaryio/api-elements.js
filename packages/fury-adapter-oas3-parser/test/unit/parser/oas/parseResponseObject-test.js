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
    const response = new namespace.elements.Member('200', {});
    const result = parse(context, response);

    expect(result.length).to.equal(1);
    const httpResponse = result.get(0);
    expect(httpResponse).to.be.instanceof(namespace.elements.HttpResponse);
  });

  describe('status code', () => {
    it('provides a warning for default responses', () => {
      const response = new namespace.elements.Member('default', {});
      const result = parse(context, response);

      expect(result.length).to.equal(1);
      expect(result).to.contain.warning("'Response Object' default responses unsupported");
    });

    it('provides a warning for range responses', () => {
      const response = new namespace.elements.Member('2XX', {});
      const result = parse(context, response);

      expect(result.length).to.equal(1);
      expect(result).to.contain.warning("'Response Object' response status code ranges are unsupported");
    });

    it('exposes the status code', () => {
      const response = new namespace.elements.Member('200', {});
      const result = parse(context, response);

      expect(result.length).to.equal(1);
      const httpResponse = result.get(0);
      expect(httpResponse).to.be.instanceof(namespace.elements.HttpResponse);

      expect(httpResponse.statusCode.toValue()).to.equal('200');
    });
  });

  it('provides warning when response is non-object', () => {
    const response = new namespace.elements.Member('200', null);

    const result = parse(context, response);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Response Object' is not an object");
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported description key', () => {
      const response = new namespace.elements.Member('200', {
        description: 'Example Response',
      });

      const result = parse(context, response);

      expect(result).to.contain.warning("'Response Object' contains unsupported key 'description'");
    });

    it('provides warning for unsupported description key', () => {
      const response = new namespace.elements.Member('200', {
        description: 'Example Response',
      });

      const result = parse(context, response);

      expect(result).to.contain.warning("'Response Object' contains unsupported key 'description'");
    });

    it('does not provide warning/errors for extensions', () => {
      const response = new namespace.elements.Member('200', {
        'x-extension': '',
      });

      const result = parse(context, response);

      expect(result).to.not.contain.annotations;
    });
  });

  it('provides warning for invalid keys', () => {
    const response = new namespace.elements.Member('200', {
      invalid: '',
    });

    const result = parse(context, response);

    expect(result).to.contain.warning("'Response Object' contains invalid key 'invalid'");
  });

  describe('#content', () => {
    it('warns when content is not an object', () => {
      const response = new namespace.elements.Member('200', {
        content: '',
      });

      const result = parse(context, response);

      expect(result).to.contain.warning("'Response Object' 'content' is not an object");
    });

    it('returns a HTTP response elements matching the media types', () => {
      const response = new namespace.elements.Member('200', {
        content: {
          'application/json': {},
          'application/hal+json': {},
        },
      });

      const result = parse(context, response);

      expect(result.length).to.equal(2);

      const jsonResponse = result.get(0);
      expect(jsonResponse).to.be.instanceof(namespace.elements.HttpResponse);
      expect(jsonResponse.contentType.toValue()).to.equal('application/json');

      const halResponse = result.get(1);
      expect(halResponse).to.be.instanceof(namespace.elements.HttpResponse);
      expect(halResponse.contentType.toValue()).to.equal('application/hal+json');
    });
  });
});
