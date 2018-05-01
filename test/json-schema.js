/* eslint-disable no-unused-expressions  */
// Allows chai `expect(null).to.be.null;`

import { expect } from 'chai';

import convertSchema from '../src/json-schema';

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

    it('removes Swagger example extension', () => {
      const schema = convertSchema({ type: 'object', example: { message: 'hello' } });

      expect(schema).to.deep.equal({ type: 'object' });
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
});
