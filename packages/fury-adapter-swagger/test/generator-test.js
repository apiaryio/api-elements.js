const { expect } = require('chai');
const { Fury } = require('fury');
const { bodyFromSchema } = require('../lib/generator');

const { minim } = new Fury();

describe('bodyFromSchema', () => {
  const parser = { minim };

  it('can generate a JSON body', () => {
    const schema = {
      type: 'array',
    };

    const payload = { content: [] };
    const asset = bodyFromSchema(schema, payload, parser, 'application/json');
    const body = JSON.parse(asset.content);

    expect(body).to.be.an('array');
  });

  it('can generate a JSON object for date format', () => {
    const schema = {
      type: 'string',
      format: 'date',
    };

    const payload = { content: [] };
    const asset = bodyFromSchema(schema, payload, parser, 'application/json');

    expect(asset.content).to.match(/^(19|20)[0-9]{2}-[0-1][0-9]-[0-3][0-9]$/);
  });

  it('can generate a JSON object for date format', () => {
    const schema = {
      type: 'string',
      format: 'date-time',
    };

    const payload = { content: [] };
    const asset = bodyFromSchema(schema, payload, parser, 'application/json');

    expect(asset.content).to.match(/^(19|20)[0-9]{2}-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]/);
  });

  it('can generate a JSON value for unknown format', () => {
    const schema = {
      type: 'string',
      format: 'unknown',
    };

    const payload = { content: [] };
    const asset = bodyFromSchema(schema, payload, parser, 'application/json');

    expect(typeof asset.content).to.equal('string');
    expect(asset.content.length).to.be.above(0);
  });

  it('limits a strings min/max length to 256', () => {
    const schema = {
      type: 'string',
      minLength: 1000,
      maxLength: 2000,
    };

    const payload = { content: [] };
    const asset = bodyFromSchema(schema, payload, parser, 'application/json');

    expect(asset.content).to.be.a('string');
    expect(asset.content.length).to.equal(256);
  });

  it('limits an array min/max items to 5', () => {
    const schema = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 10,
      maxItems: 20,
    };

    const payload = { content: [] };
    const asset = bodyFromSchema(schema, payload, parser, 'application/json');
    const body = JSON.parse(asset.content);

    expect(body).to.be.an('array');
    expect(body.length).to.equal(5);
  });

  it('can generate a structure with references', () => {
    const schema = {
      type: 'array',
      items: {
        $ref: '#/definitions/User',
      },
      minItems: 1,
      maxItems: 1,
      definitions: {
        User: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'doe' },
          },
        },
      },
    };

    const payload = { content: [] };
    const asset = bodyFromSchema(schema, payload, parser, 'application/json');
    const body = JSON.parse(asset.content);

    expect(body).to.deep.equal([{ name: 'doe' }]);
  });

  describe('multipart/form-data', () => {
    it('can generate multipart form with specified boundary', () => {
      const schema = {
        type: 'object',
        properties: {
          example: {
            type: 'string',
            enum: ['Hello'],
          },
        },
        required: ['example'],
      };

      const payload = { content: [] };
      const asset = bodyFromSchema(schema, payload, parser, 'multipart/form-data; boundary=boundy');

      expect(asset.content).to.be.a('string');
      expect(asset.content).to.equal('--boundy\r\nContent-Disposition: form-data; name="example"\r\n\r\nHello\r\n\r\n--boundy--\r\n');
    });

    it('can generate multipart form with multiple parts', () => {
      const schema = {
        type: 'object',
        properties: {
          example1: {
            type: 'string',
            enum: ['Hello'],
          },
          example2: {
            type: 'string',
            enum: ['Hello'],
          },
        },
        required: ['example1', 'example2'],
      };

      const payload = { content: [] };
      const asset = bodyFromSchema(schema, payload, parser, 'multipart/form-data; boundary=boundy');

      expect(asset.content).to.be.a('string');
      expect(asset.content).to
        .equal('--boundy\r\nContent-Disposition: form-data; name="example1"\r\n\r\nHello\r\n'
          + '--boundy\r\nContent-Disposition: form-data; name="example2"\r\n\r\nHello\r\n'
          + '\r\n--boundy--\r\n');
    });
  });

  describe('application/json', () => {
    const generate = (schema) => {
      const payload = { content: [] };
      const asset = bodyFromSchema(schema, payload, parser, 'application/json');
      return JSON.parse(asset.content);
    };

    describe('array type', () => {
      it('can generate an array without any items', () => {
        const schema = {
          type: 'array',
        };

        const body = generate(schema);

        expect(body).to.deep.equal([]);
      });

      it('can generate an array with items', () => {
        const schema = {
          type: 'array',
          items: {
            type: 'string',
            examples: ['doe'],
          },
        };

        const body = generate(schema);

        expect(body).to.deep.equal(['doe']);
      });
    });

    describe('object type', () => {
      it('can generate an object without any properties', () => {
        const schema = {
          type: 'object',
        };

        const body = generate(schema);

        expect(body).to.deep.equal({});
      });

      it('can generate a JSON object from optional properties', () => {
        const schema = {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              examples: ['doe'],
            },
          },
        };

        const body = generate(schema);

        expect(body).to.deep.equal({ name: 'doe' });
      });
    });
  });
});
