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

  describe('#headers', () => {
    it('provides warning when headers is not an object', () => {
      const response = new namespace.elements.Object({
        description: 'response 200',
        headers: 'dummy',
      });

      const parseResult = parse(context, response);

      expect(parseResult).to.contain.warning("'Response Object' 'headers' is not an object");
    });

    it('doesn\'t contain HTTP Headers if headers are empty ', () => {
      const response = new namespace.elements.Object({
        description: 'dummy',
        headers: {},
      });

      const result = parse(context, response);

      expect(result).to.not.contain.annotations;
      const httpResponse = result.get(0);
      expect(httpResponse).to.be.instanceof(namespace.elements.HttpResponse);
      expect(httpResponse.headers).to.be.undefined;
    });

    it('does parse Header Object', () => {
      const response = new namespace.elements.Object({
        description: 'dummy',
        headers: {
          first: {},
          second: {},
        },
      });

      const result = parse(context, response);

      expect(result).to.not.contain.annotations;
      const httpResponse = result.get(0);
      expect(httpResponse).to.be.instanceof(namespace.elements.HttpResponse);

      const { headers } = httpResponse;
      expect(headers).is.instanceof(namespace.elements.HttpHeaders);
      expect(headers.length).to.be.equal(2);

      const header1 = headers.get(0);
      expect(header1).is.instanceof(namespace.elements.Member);
      expect(header1.key.toValue()).to.be.equal('first');
      expect(header1.value).to.be.instanceof(namespace.elements.String);
      expect(header1.value.toValue()).to.be.undefined;

      const header2 = headers.get(1);
      expect(header2).is.instanceof(namespace.elements.Member);
      expect(header2.key.toValue()).to.be.equal('second');
      expect(header2.value).to.be.instanceof(namespace.elements.String);
      expect(header2.value.toValue()).to.be.undefined;
    });

    it('can parse headers as reference', () => {
      const response = new namespace.elements.Object({
        description: 'dummy',
        headers: {
          referenced: {
            $ref: '#/components/headers/Example',
          },
        },
      });

      const dataStructure = new namespace.elements.DataStructure();
      dataStructure.id = 'Node';

      context.state.components = new namespace.elements.Object({
        schemas: {
          Node: dataStructure,
        },
      });

      context.state.components.set('headers', new namespace.elements.Object([
        new namespace.elements.Member('Example', new namespace.elements.String('value')),
      ]));

      const result = parse(context, response);

      expect(result).to.not.contain.annotations;
      expect(result.length).to.equal(1);

      const { headers } = result.get(0);
      expect(headers).is.instanceof(namespace.elements.HttpHeaders);
      expect(headers.length).to.be.equal(1);
    });

    it('headers do not override content', () => {
      const response = new namespace.elements.Object({
        description: 'response 200',
        headers: {
          'x-next': {
            description: 'A link to the next page of responses',
            schema: {
              type: 'string',
            },
          },
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Pets',
            },
          },
        },
      });

      const pets = new namespace.elements.Array();
      pets.id = 'Pets';
      context.state.components = new namespace.elements.Object({
        schemas: {
          Pets: new namespace.elements.DataStructure(pets),
        },
      });

      const parseResult = parse(context, response);

      expect(parseResult.get(0).headers.length).to.be.equal(2);

      const header1 = parseResult.get(0).headers.get(0);
      expect(header1).is.instanceof(namespace.elements.Member);
      expect(header1.key.toValue()).to.be.equal('Content-Type');
      expect(header1.value).to.be.instanceof(namespace.elements.String);
      expect(header1.value.toValue()).to.be.equal('application/json');

      const header2 = parseResult.get(0).headers.get(1);
      expect(header2).is.instanceof(namespace.elements.Member);
      expect(header2.key.toValue()).to.be.equal('x-next');
      expect(header2.value).to.be.instanceof(namespace.elements.String);
      expect(header2.value.toValue()).to.be.undefined;
    });
  });

  describe('warnings for unsupported properties', () => {
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
