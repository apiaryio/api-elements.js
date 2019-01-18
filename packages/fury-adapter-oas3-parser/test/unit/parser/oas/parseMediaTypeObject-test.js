const { Fury } = require('fury');
const { expect } = require('../../chai');
const parse = require('../../../../lib/parser/oas/parseMediaTypeObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('Media Type Object', () => {
  let context;
  const messageBodyClass = namespace.elements.HttpResponse;

  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides warning when media type is non-object', () => {
    const mediaType = new namespace.elements.Member('application/json', null);

    const result = parse(context, messageBodyClass, mediaType);

    expect(result).to.contain.warning("'Media Type Object' is not an object");
  });

  it('returns a HTTP message body', () => {
    const mediaType = new namespace.elements.Member('application/json', {});

    const result = parse(context, messageBodyClass, mediaType);

    const message = result.get(0);
    expect(message).to.be.instanceof(messageBodyClass);
    expect(message.contentType.toValue()).to.equal('application/json');
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported schema key', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        schema: {},
      });

      const result = parse(context, messageBodyClass, mediaType);

      expect(result).to.contain.warning("'Media Type Object' contains unsupported key 'schema'");
    });

    it('provides warning for unsupported examples key', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        examples: {},
      });

      const result = parse(context, messageBodyClass, mediaType);

      expect(result).to.contain.warning("'Media Type Object' contains unsupported key 'examples'");
    });

    it('provides warning for unsupported encoding key', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        encoding: {},
      });

      const result = parse(context, messageBodyClass, mediaType);

      expect(result).to.contain.warning("'Media Type Object' contains unsupported key 'encoding'");
    });
  });

  describe('#example', () => {
    it('creates an messageBody asset from an example for JSON type', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        example: {
          message: 'Hello World',
        },
      });

      const result = parse(context, messageBodyClass, mediaType);

      const message = result.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('{"message":"Hello World"}');
      expect(message.messageBody.contentType.toValue()).to.equal('application/json');
    });

    it('creates an messageBody asset from an example for JSON subtype', () => {
      const mediaType = new namespace.elements.Member('application/hal+json', {
        example: {
          message: 'Hello World',
        },
      });

      const result = parse(context, messageBodyClass, mediaType);

      const message = result.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('{"message":"Hello World"}');
      expect(message.messageBody.contentType.toValue()).to.equal('application/hal+json');
    });

    it('warns for example without JSON type', () => {
      const mediaType = new namespace.elements.Member('application/xml', {
        example: {
          message: 'Hello World',
        },
      });

      const result = parse(context, messageBodyClass, mediaType);

      const message = result.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody).to.be.undefined;

      expect(result).to.contain.warning(
        "'Media Type Object' 'example' is only supported for JSON media types"
      );
    });
  });
});
