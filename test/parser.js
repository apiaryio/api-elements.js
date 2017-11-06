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
});
