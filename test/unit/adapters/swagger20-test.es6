import fs from 'fs';
import path from 'path';

import { assert } from 'chai';
import * as swagger20Adapter from '../../../lib/adapters/swagger20';

import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';

const base = path.join(__dirname, '../../fixtures/adapters/swagger20');

const swagger20ExampleFile = fs.readFileSync(path.join(base, 'swagger-2.0-example.json'), 'utf8');

const apiDescriptionExampleFile = fs.readFileSync(path.join(base, 'api-description-example.json'), 'utf8');
const apiDescriptionExample = JSON.parse(apiDescriptionExampleFile);

describe('Swagger Adapter', () => {
  it('has the correct name', () => {
    assert.equal(swagger20Adapter.name, 'swagger20');
  });

  it('correct detects a Swagger 2.0 document', () => {
    assert.isTrue(swagger20Adapter.detect(swagger20ExampleFile));
  });

  context('when parsing a Swagger 2.0 document', () => {
    let parsedDocument;

    before((done) => {
      const minim = minimModule.namespace()
        .use(minimParseResult);

      swagger20Adapter.parse({minim, source: swagger20ExampleFile}, (error, apiDescription) => {
        parsedDocument = apiDescription.toRefract();
        done(error);
      });
    });

    it('correctly parses the document', () => {
      assert.deepEqual(parsedDocument, apiDescriptionExample);
    });
  });
});
