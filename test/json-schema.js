/* eslint-disable no-unused-expressions  */
// Allows chai `expect(null).to.be.null;`

import { expect } from 'chai';

import { convertSchema, convertSchemaDefinitions } from '../src/json-schema';

describe('Swagger Schema to JSON Schema', () => {
  it('returns compatible schema when given valid JSON Schema', () => {
    const schema = convertSchema({ type: 'object' });

    expect(schema).to.deep.equal({ type: 'object' });
  });

  describe('extension removal', () => {
    it('removes Swagger vendored extensions', () => {
      const schema = convertSchema({ type: 'object', 'x-extension': 'example' });

      expect(schema).to.deep.equal({ type: 'object' });
    });

    it('removes Swagger discriminator extension', () => {
      const schema = convertSchema({ type: 'object', discriminator: 'example' });

      expect(schema).to.deep.equal({ type: 'object' });
    });

    it('removes Swagger readOnly extension', () => {
      const schema = convertSchema({ type: 'object', readOnly: true });

      expect(schema).to.deep.equal({ type: 'object' });
    });

    it('removes Swagger xml extension', () => {
      const schema = convertSchema({ type: 'object', xml: { name: 'example' } });

      expect(schema).to.deep.equal({ type: 'object' });
    });

    it('removes Swagger externalDocs extension', () => {
      const schema = convertSchema({ type: 'object', externalDocs: { url: 'https://example.com' } });

      expect(schema).to.deep.equal({ type: 'object' });
    });

    it('translates Swagger example extension to examples', () => {
      const schema = convertSchema({ type: 'object', example: { message: 'hello' } });

      expect(schema).to.deep.equal({
        type: 'object',
        examples: [
          { message: 'hello' },
        ],
      });
    });

    it('dereferences Swagger example extension to examples', () => {
      const root = {
        definitions: {
          User: {
            example: { message: 'hello' },
          },
        },
      };
      const swaggerSchema = {
        type: 'object',
        example: { $ref: '#/definitions/User/example' },
      };
      const schema = convertSchema(swaggerSchema, {}, root);

      expect(schema).to.deep.equal({
        type: 'object',
        examples: [
          { message: 'hello' },
        ],
      });
    });

    it('dereferences nested object Swagger example extension to examples', () => {
      const root = {
        definitions: {
          User: {
            example: { message: 'hello' },
          },
        },
      };
      const swaggerSchema = {
        type: 'object',
        example: {
          user: { $ref: '#/definitions/User/example' },
        },
      };
      const schema = convertSchema(swaggerSchema, {}, root);

      expect(schema).to.deep.equal({
        type: 'object',
        examples: [
          {
            user: { message: 'hello' },
          },
        ],
      });
    });

    it('dereferences nested array Swagger example extension to examples', () => {
      const root = {
        definitions: {
          User: {
            example: { message: 'hello' },
          },
        },
      };
      const swaggerSchema = {
        type: 'object',
        example: [
          { $ref: '#/definitions/User/example' },
        ],
      };
      const schema = convertSchema(swaggerSchema, {}, root);

      expect(schema).to.deep.equal({
        type: 'object',
        examples: [
          [{ message: 'hello' }],
        ],
      });
    });
  });

  context('x-nullable', () => {
    it('ignores false x-nullable', () => {
      const schema = convertSchema({ type: 'string', 'x-nullable': false });

      expect(schema).to.deep.equal({ type: 'string' });
    });

    it('translates x-nullable to type null without existing type', () => {
      const schema = convertSchema({ 'x-nullable': true });

      expect(schema).to.deep.equal({ type: 'null' });
    });

    it('translates x-nullable to type null with existing type', () => {
      const schema = convertSchema({ type: 'string', 'x-nullable': true });

      expect(schema).to.deep.equal({ type: ['string', 'null'] });
    });
  });

  describe('recursive conversion', () => {
    it('recursively converts allOf', () => {
      const schema = convertSchema({
        allOf: [
          {
            type: 'string',
            'x-additional': true,
          },
        ],
      });

      expect(schema).to.deep.equal({
        allOf: [
          {
            type: 'string',
          },
        ],
      });
    });

    it('recursively converts anyOf', () => {
      const schema = convertSchema({
        anyOf: [
          {
            type: 'string',
            'x-additional': true,
          },
        ],
      });

      expect(schema).to.deep.equal({
        anyOf: [
          {
            type: 'string',
          },
        ],
      });
    });

    it('recursively converts oneOf', () => {
      const schema = convertSchema({
        oneOf: [
          {
            type: 'string',
            'x-additional': true,
          },
        ],
      });

      expect(schema).to.deep.equal({
        oneOf: [
          {
            type: 'string',
          },
        ],
      });
    });

    it('recursively converts not', () => {
      const schema = convertSchema({
        not: {
          type: 'string',
          'x-additional': true,
        },
      });

      expect(schema).to.deep.equal({
        not: {
          type: 'string',
        },
      });
    });

    describe('for array validation', () => {
      it('recursively converts items subschema', () => {
        const schema = convertSchema({
          type: 'array',
          items: {
            type: 'string',
            'x-additional': true,
          },
        });

        expect(schema).to.deep.equal({
          type: 'array',
          items: {
            type: 'string',
          },
        });
      });

      it('recursively converts items array subschema', () => {
        const schema = convertSchema({
          type: 'array',
          items: [
            {
              type: 'string',
              'x-additional': true,
            },
          ],
        });

        expect(schema).to.deep.equal({
          type: 'array',
          items: [
            {
              type: 'string',
            },
          ],
        });
      });

      it('recursively converts additionalItems', () => {
        const schema = convertSchema({
          type: 'array',
          additionalItems: {
            type: 'string',
            'x-additional': true,
          },
        });

        expect(schema).to.deep.equal({
          type: 'array',
          additionalItems: {
            type: 'string',
          },
        });
      });

      it('retains boolean additionalItems', () => {
        const schema = convertSchema({
          type: 'array',
          additionalItems: true,
        });

        expect(schema).to.deep.equal({
          type: 'array',
          additionalItems: true,
        });
      });
    });

    describe('for object validation', () => {
      it('recursively converts properties', () => {
        const schema = convertSchema({
          type: 'object',
          properties: {
            example: {
              type: 'string',
              readOnly: true,
            },
          },
        });

        expect(schema).to.deep.equal({
          type: 'object',
          properties: {
            example: {
              type: 'string',
            },
          },
        });
      });

      it('recursively converts patternProperties', () => {
        const schema = convertSchema({
          type: 'object',
          patternProperties: {
            '[0-9]': {
              type: 'string',
              readOnly: true,
            },
          },
        });

        expect(schema).to.deep.equal({
          type: 'object',
          patternProperties: {
            '[0-9]': {
              type: 'string',
            },
          },
        });
      });

      it('recursively converts additionalProperties', () => {
        const schema = convertSchema({
          type: 'object',
          additionalProperties: {
            type: 'string',
            'x-additional': true,
          },
        });

        expect(schema).to.deep.equal({
          type: 'object',
          additionalProperties: {
            type: 'string',
          },
        });
      });

      it('retains boolean additionalProperties', () => {
        const schema = convertSchema({
          type: 'object',
          additionalProperties: true,
        });

        expect(schema).to.deep.equal({
          type: 'object',
          additionalProperties: true,
        });
      });
    });
  });

  describe('$ref', () => {
    it('dereferences root reference', () => {
      const root = {
        definitions: {
          User: {
            type: 'object',
          },
        },
      };

      const schema = convertSchema({
        $ref: '#/definitions/User',
      }, root);

      expect(schema).to.deep.equal({
        type: 'object',
      });
    });

    it('does not dererferences circular root reference', () => {
      const root = {
        definitions: {
          Node: {
            type: 'object',
            properties: {
              parent: {
                $ref: '#/definitions/Node',
              },
            },
          },
        },
      };

      const schema = convertSchema({
        $ref: '#/definitions/Node',
      }, root);

      expect(schema).to.deep.equal({
        allOf: [
          { $ref: '#/definitions/Node' },
        ],
        definitions: {
          Node: {
            type: 'object',
            properties: {
              parent: {
                $ref: '#/definitions/Node',
              },
            },
          },
        },
      });
    });

    it('does not dererferences root when references found inside schema with items', () => {
      const root = {
        definitions: {
          Node: {
            type: 'object',
            properties: {
              children: {
                type: 'array',
                items: [
                  { $ref: '#/definitions/Node' },
                ],
              },
            },
          },
        },
      };

      const schema = convertSchema({
        $ref: '#/definitions/Node',
      }, root);

      expect(schema).to.deep.equal({
        allOf: [
          { $ref: '#/definitions/Node' },
        ],
        definitions: {
          Node: {
            type: 'object',
            properties: {
              children: {
                type: 'array',
                items: [
                  { $ref: '#/definitions/Node' },
                ],
              },
            },
          },
        },
      });
    });

    it('copies references to schema', () => {
      const root = {
        definitions: {
          User: {
            type: 'object',
          },
        },
      };

      const schema = convertSchema({
        type: 'array',
        items: {
          $ref: '#/definitions/User',
        },
      }, root);

      expect(schema).to.deep.equal({
        type: 'array',
        items: {
          $ref: '#/definitions/User',
        },
        definitions: {
          User: {
            type: 'object',
          },
        },
      });
    });

    it('recursively handles references to schema', () => {
      const root = {
        definitions: {
          User: {
            type: 'object',
            properties: {
              last_comment: {
                $ref: '#/definitions/Comment',
              },
            },
          },
          Comment: {
            type: 'object',
          },
        },
      };

      const schema = convertSchema({
        type: 'array',
        items: {
          $ref: '#/definitions/User',
        },
      }, root);

      expect(schema).to.deep.equal({
        type: 'array',
        items: {
          $ref: '#/definitions/User',
        },
        definitions: {
          User: {
            type: 'object',
            properties: {
              last_comment: {
                $ref: '#/definitions/Comment',
              },
            },
          },
          Comment: {
            type: 'object',
          },
        },
      });
    });

    describe('invalid references', () => {
      it('errors for non-root reference', () => {
        expect(() => {
          convertSchema({ $ref: 'https://example.com' });
        }).to.throw('must start with document root');
      });

      it('errors for non-definitions reference', () => {
        expect(() => {
          convertSchema({ $ref: '#/defs' });
        }).to.throw('must be reference to #/definitions');
      });

      it('errors for non-definitions reference', () => {
        expect(() => {
          convertSchema({ $ref: '#/definitions/Bar' }, {});
        }).to.throw('Reference to #/definitions/Bar does not exist');
      });
    });
  });

  describe('converting JSON Schema definitions', () => {
    it('can convert a Swagger Schema definitions section', () => {
      const result = convertSchemaDefinitions({
        User: {
          type: 'object',
          'x-extension': true,
        },
      });

      expect(result).to.deep.equal({
        User: {
          type: 'object',
        },
      });
    });

    it('can convert a Swagger Schema definition with root reference', () => {
      const result = convertSchemaDefinitions({
        Base: {
          type: 'object',
        },
        User: {
          $ref: '#/definitions/Base',
        },
      });

      expect(result).to.deep.equal({
        Base: {
          type: 'object',
        },
        User: {
          $ref: '#/definitions/Base',
        },
      });
    });
  });
});
