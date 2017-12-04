import { expect } from 'chai';

import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';

import { bodyFromSchema } from '../src/generator';

const minim = minimModule.namespace()
  .use(minimParseResult);

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
        .equal('--boundy\r\nContent-Disposition: form-data; name="example1"\r\n\r\nHello\r\n' +
          '--boundy\r\nContent-Disposition: form-data; name="example2"\r\n\r\nHello\r\n' +
          '\r\n--boundy--\r\n');
    });
  });
});
