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

    const parseResult = parse(context, messageBodyClass, mediaType);

    expect(parseResult).to.contain.warning("'Media Type Object' is not an object");
  });

  it('provides warning when content type is invalid', () => {
    const mediaType = new namespace.elements.Member('foo', {});

    const parseResult = parse(context, messageBodyClass, mediaType);

    expect(parseResult).to.contain.warning("'Media Type Object' media type 'foo' is invalid");
  });

  it('provides warning when media type is invalid', () => {
    const mediaType = new namespace.elements.Member('*/*', {});

    const parseResult = parse(context, messageBodyClass, mediaType);

    expect(parseResult).to.contain.warning("'Media Type Object' media type '*/*' is invalid");
  });

  it('permits media type with parameters', () => {
    const mediaType = new namespace.elements.Member('application/json; charset=utf-8', {});

    const parseResult = parse(context, messageBodyClass, mediaType);

    const message = parseResult.get(0);
    expect(message).to.be.instanceof(messageBodyClass);
    expect(message.contentType.toValue()).to.equal('application/json; charset=utf-8');
  });

  it('returns a HTTP message body', () => {
    const mediaType = new namespace.elements.Member('application/json', {});

    const parseResult = parse(context, messageBodyClass, mediaType);

    const message = parseResult.get(0);
    expect(message).to.be.instanceof(messageBodyClass);
    expect(message.contentType.toValue()).to.equal('application/json');
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported encoding key', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        encoding: {},
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      expect(parseResult).to.contain.warning("'Media Type Object' contains unsupported key 'encoding'");
    });
  });

  describe('#example', () => {
    it('creates an messageBody asset from an example for JSON type', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        example: {
          message: 'Hello World',
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
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

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('{"message":"Hello World"}');
      expect(message.messageBody.contentType.toValue()).to.equal('application/hal+json');
    });

    it('creates an messageBody asset for text type with text example', () => {
      const mediaType = new namespace.elements.Member('text/plain', {
        example: 'Hello World',
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('Hello World');
      expect(message.messageBody.contentType.toValue()).to.equal('text/plain');
    });

    it('creates an messageBody asset for text type with xml example', () => {
      const mediaType = new namespace.elements.Member('application/xml', {
        example: '<?xml version="1.0" encoding="UTF-8"?>',
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('<?xml version="1.0" encoding="UTF-8"?>');
      expect(message.messageBody.contentType.toValue()).to.equal('application/xml');
    });

    it('warns for example without supported media type', () => {
      const mediaType = new namespace.elements.Member('application/plist', {
        example: {
          message: 'Hello World',
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody).to.be.undefined;

      expect(parseResult).to.contain.warning(
        "'Media Type Object' 'example' is not supported for media type 'application/plist'"
      );
    });
  });

  describe('#examples', () => {
    it('provides warning when examples is non-object', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        examples: null,
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      expect(parseResult).to.contain.warning("'Media Type Object' 'examples' is not an object");
    });

    it('ignores empty examples', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        examples: {},
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody).to.be.undefined;
    });

    it('ignores empty example', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        examples: {
          cat: {},
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody).to.be.undefined;
    });

    it('creates an messageBody asset from an example for JSON type', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        examples: {
          cat: {
            value: {
              message: 'Hello World',
            },
          },
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('{"message":"Hello World"}');
      expect(message.messageBody.contentType.toValue()).to.equal('application/json');
    });

    it('warns for examples without JSON type', () => {
      const mediaType = new namespace.elements.Member('application/xml', {
        examples: {
          cat: {
            value: {
              message: 'Hello World',
            },
          },
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody).to.be.undefined;

      expect(parseResult).to.contain.warning(
        "'Media Type Object' 'examples' is only supported for JSON media types"
      );
    });

    it('warns for unsupported multiple examples', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        examples: {
          cat: {
            value: {
              message: 'Hello World',
            },
          },
          dog: {
            value: {
              message: 'Hello World',
            },
          },
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);

      expect(parseResult).to.contain.warning(
        "'Media Type Object' 'examples' only one example is supported, other examples have been ignored"
      );
    });
  });

  describe('#schema', () => {
    it('parses a schema into a data structure', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        schema: {
          type: 'object',
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.dataStructure).to.be.instanceof(namespace.elements.DataStructure);
      expect(message.dataStructure.content).to.be.instanceof(namespace.elements.Object);
    });

    it('parses a schema reference into as data structure', () => {
      context.state.components = new namespace.elements.Object({
        schemas: {
          // Data Structure for an Object
          User: new namespace.elements.DataStructure(
            new namespace.elements.Object(undefined, {
              id: 'User',
            })
          ),
        },
      });

      const mediaType = new namespace.elements.Member('application/json', {
        schema: {
          $ref: '#/components/schemas/User',
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.dataStructure).to.be.instanceof(namespace.elements.DataStructure);
      expect(message.dataStructure.content.element).to.equal('User');
    });

    it('generates an messageBody asset for JSON type with no examples', () => {
      const mediaType = new namespace.elements.Member('application/json', {
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'doe',
            },
          },
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('{"name":"doe"}');
      expect(message.messageBody.contentType.toValue()).to.equal('application/json');
    });

    it('generates a messageBody asset for JSON type with referenced schema with no examples', () => {
      context.state.components = new namespace.elements.Object({
        schemas: {
          Name: new namespace.elements.DataStructure(
            new namespace.elements.String('doe', {
              id: 'Name',
            })
          ),
        },
      });

      const mediaType = new namespace.elements.Member('application/json', {
        schema: {
          type: 'object',
          properties: {
            name: {
              $ref: '#/components/schemas/Name',
            },
          },
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('{"name":"doe"}');
      expect(message.messageBody.contentType.toValue()).to.equal('application/json');
    });

    it('generates a messageBody asset for JSON type with circular referenced schema with no examples', () => {
      const node = new namespace.Element();
      node.element = 'Node';

      const nodes = new namespace.Element();
      nodes.element = 'Nodes';

      context.state.components = new namespace.elements.Object({
        schemas: {
          Nodes: new namespace.elements.DataStructure(
            new namespace.elements.Array({
              node,
            }, {
              id: 'Nodes',
            })
          ),
          Node: new namespace.elements.DataStructure(
            new namespace.elements.Object({
              parents: nodes,
            }, {
              id: 'Node',
            })
          ),
        },
      });

      const mediaType = new namespace.elements.Member('application/json', {
        schema: {
          $ref: '#/components/schemas/Node',
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('{"parents":[]}');
      expect(message.messageBody.contentType.toValue()).to.equal('application/json');
    });

    it('generates an messageBody asset for text type with string schema', () => {
      const mediaType = new namespace.elements.Member('text/plain', {
        schema: {
          type: 'string',
          example: 'hello world',
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody.toValue()).to.equal('hello world');
      expect(message.messageBody.contentType.toValue()).to.equal('text/plain');
    });

    it('does not generates an messageBody asset for text type with non string type', () => {
      const mediaType = new namespace.elements.Member('text/plain', {
        schema: {
          type: 'number',
          example: 5,
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody).to.be.undefined;
    });

    it('does not generate a messageBody asset when generateMessageBody is disabled', () => {
      context.options.generateMessageBody = false;

      const mediaType = new namespace.elements.Member('application/json', {
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'doe',
            },
          },
        },
      });

      const parseResult = parse(context, messageBodyClass, mediaType);

      const message = parseResult.get(0);
      expect(message).to.be.instanceof(messageBodyClass);
      expect(message.messageBody).to.be.undefined;
    });
  });
});
