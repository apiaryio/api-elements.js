import fs from 'fs';
import path from 'path';

import { assert } from 'chai';

import fury from '../../../lib/fury';

const base = path.join(__dirname, '../../fixtures/adapters/swagger20');

const swagger20Example = fs.readFileSync(path.join(base, 'swagger-2.0-example.json'), 'utf8');

const apiDescriptionExampleFile = fs.readFileSync(path.join(base, 'api-description-example.json'), 'utf8');
const apiDescriptionExample = JSON.parse(apiDescriptionExampleFile, 'utf8');

describe('Swagger 2.0 Integration', () => {
  let apiDescription;

  before((done) => {
    fury.parse({ source: swagger20Example }, (error, refract) => {
      apiDescription = refract.toRefract();
      done(error);
    });
  });

  it('correctly parses a Swagger 2.0 document', () => {
    assert.deepEqual(apiDescription, apiDescriptionExample);
  });
});
