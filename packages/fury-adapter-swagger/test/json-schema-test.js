const { expect } = require('chai');
const { convertSchema, convertSchemaDefinitions, dereference } = require('../lib/json-schema');

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

    it('translates Swagger example extension to examples where example has property length', () => {
      const schema = convertSchema({ type: 'object', example: { length: 2 } });

      expect(schema).to.deep.equal({
        type: 'object',
        examples: [
          { length: 2 },
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

    it('copies arbitary references to schema', () => {
      const root = {
        definitions: {
          User: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        },
      };

      const schema = convertSchema({
        type: 'array',
        items: {
          $ref: '#/definitions/User/properties/name',
        },
      }, root);

      expect(schema).to.deep.equal({
        type: 'array',
        items: {
          $ref: '#/definitions/User/properties/name',
        },
        definitions: {
          User: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
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

    it('can convert a Swagger Schema definition with a reference to Swagger Schema example', () => {
      // This test came from a regression that caused the User schema to be
      // mutated during the Swagger Schema to JSON Schema conversion and
      // thus breaking the reference to `example` (`examples` in JSON Schema)

      const result = convertSchemaDefinitions({
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Doe',
            },
          },
        },
        Comment: {
          type: 'object',
          example: {
            name: {
              $ref: '#/definitions/User/properties/name/example',
            },
          },
        },
      });

      expect(result).to.deep.equal({
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              examples: ['Doe'],
            },
          },
        },
        Comment: {
          type: 'object',
          examples: [
            {
              name: 'Doe',
            },
          ],
        },
      });
    });
  });
});

describe('Dereferencing', () => {
  it('can dereference an object without references', () => {
    const result = dereference({ type: 'object' });

    expect(result).to.deep.equal({
      type: 'object',
    });
  });

  it('can dereference an object with reference', () => {
    const result = dereference({ $ref: '#/definitions/User' }, {
      definitions: {
        User: {
          type: 'object',
        },
      },
    });

    expect(result).to.deep.equal({
      type: 'object',
    });
  });

  it('can dereference an object with a reference to another reference', () => {
    const result = dereference({ $ref: '#/definitions/User' }, {
      definitions: {
        User: {
          $ref: '#/definitions/BaseUser',
        },
        BaseUser: {
          type: 'object',
        },
      },
    });

    expect(result).to.deep.equal({
      type: 'object',
    });
  });

  it('can dereference an array with a reference', () => {
    const result = dereference([{ $ref: '#/definitions/User' }], {
      definitions: {
        User: {
          $ref: '#/definitions/BaseUser',
        },
        BaseUser: {
          type: 'object',
        },
      },
    });

    expect(result).to.deep.equal([
      {
        type: 'object',
      },
    ]);
  });

  it('can dereference a direct circular reference', () => {
    const result = dereference({ $ref: '#/definitions/Node' }, {
      definitions: {
        Node: {
          name: 'Doe',
          parent: { $ref: '#/definitions/Node' },
        },
      },
    });

    expect(result).to.deep.equal({
      name: 'Doe',
      parent: {},
    });
  });

  it('can dereference an indirect circular reference', () => {
    const result = dereference({ $ref: '#/definitions/User' }, {
      definitions: {
        User: {
          name: 'Doe',
          company: {
            $ref: '#/definitions/Company',
          },
        },
        Company: {
          owner: {
            $ref: '#/definitions/User',
          },
        },
      },
    });

    expect(result).to.deep.equal({
      name: 'Doe',
      company: {
        owner: {},
      },
    });
  });

  it('does not dereference non-string references', () => {
    // https://github.com/apiaryio/fury-adapter-swagger/issues/235

    // Schema for a JSON ReferencePointer
    const result = dereference({
      type: 'object',
      properties: {
        $ref: {
          type: 'string',
        },
      },
    });

    expect(result).to.deep.equal({
      type: 'object',
      properties: {
        $ref: {
          type: 'string',
        },
      },
    });
  });
});
