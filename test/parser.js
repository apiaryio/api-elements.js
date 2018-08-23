import { expect } from 'chai';
import fury from 'fury';
import Parser from '../src/parser';

describe('Parser', () => {
  let parser;

  before(() => {
    parser = new Parser({ minim: fury.minim });
    parser.swagger = {
      consumes: [],
      produces: [],
    };
  });

  context('content types', () => {
    it('gathers null response type when no examples or produces', () => {
      const methodValue = {};
      const examples = {};
      const contentTypes = parser.gatherResponseContentTypes(methodValue, examples);

      expect(contentTypes).to.deep.equal([null]);
    });

    it('gathers all example response content types', () => {
      const methodValue = {};
      const examples = {
        'application/json': '',
        'application/hal+json': '',
        'application/xml': '',
      };
      const contentTypes = parser.gatherResponseContentTypes(methodValue, examples);

      expect(contentTypes).to.deep.equal([
        'application/json',
        'application/hal+json',
        'application/xml',
      ]);
    });

    it('gathers first JSON produces without examples', () => {
      const methodValue = {
        produces: [
          'text/plain',
          'application/json',
          'application/hal+json',
        ],
      };
      const examples = {};
      const contentTypes = parser.gatherResponseContentTypes(methodValue, examples);

      expect(contentTypes).to.deep.equal(['application/json']);
    });

    it('gathers only example response content types with produces', () => {
      const methodValue = {
        produces: [
          'application/json',
          'application/problem+json',
        ],
      };
      const examples = {
        'application/vnd.error+json': '',
      };
      const contentTypes = parser.gatherResponseContentTypes(methodValue, examples);

      expect(contentTypes).to.deep.equal(['application/vnd.error+json']);
    });

    it('rejects invalid content types when gathering response content types', () => {
      const methodValue = {};
      const examples = { '!!!': '' };
      const contentTypes = parser.gatherResponseContentTypes(methodValue, examples);

      expect(contentTypes).to.deep.equal([null]);
    });
  });

  context('schema', () => {
    it('can push schema onto HTTP message payload', () => {
      const schema = { type: 'object' };
      const payload = new fury.minim.elements.HttpResponse();
      parser.pushBodyAssets(schema, payload);

      expect(payload.messageBodySchema.toValue()).to.deep.equal('{"type":"object"}');
    });

    it('strips extensions from schema', () => {
      const schema = { type: 'object', 'x-test': true };
      const payload = new fury.minim.elements.HttpResponse();
      parser.pushBodyAssets(schema, payload);

      expect(payload.messageBodySchema.toValue()).to.deep.equal('{"type":"object"}');
    });

    it('adds null to type when x-nullable is provided', () => {
      const schema = { type: 'object', 'x-nullable': true };
      const payload = new fury.minim.elements.HttpResponse();
      parser.pushBodyAssets(schema, payload);

      expect(payload.messageBodySchema.toValue()).to.deep.equal('{"type":["object","null"]}');
    });

    it('sets null as type when x-nullable is provided without type', () => {
      const schema = { 'x-nullable': true };
      const payload = new fury.minim.elements.HttpResponse();
      parser.pushBodyAssets(schema, payload);

      expect(payload.messageBodySchema.toValue()).to.deep.equal('{"type":"null"}');
    });

    it('adds null value to enum when x-nullable is provided', () => {
      const schema = { 'x-nullable': true, enum: ['north', 'south'] };
      const payload = new fury.minim.elements.HttpResponse();
      parser.pushBodyAssets(schema, payload);

      expect(payload.messageBodySchema.toValue()).to.deep.equal('{"enum":["north","south",null]}');
    });

    it('does not add null value to enum when x-nullable is provided and null in enum', () => {
      const schema = { 'x-nullable': true, enum: ['north', 'south', null] };
      const payload = new fury.minim.elements.HttpResponse();
      parser.pushBodyAssets(schema, payload);

      expect(payload.messageBodySchema.toValue()).to.deep.equal('{"enum":["north","south",null]}');
    });
  });
});
