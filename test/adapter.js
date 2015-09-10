/*
 * Tests for API Blueprint serializer.
 */

import {expect} from 'chai';

import adapter from '../src/adapter';
import fs from 'fs';
import fury from 'fury';
import glob from 'glob';
import path from 'path';

const base = path.join(__dirname, 'fixtures');

describe('API Blueprint serializer adapter', () => {
  const files = glob.sync(path.join(base, '*.json'));

  files.forEach((file) => {
    const apib = file.substr(0, file.length - 4) + 'apib';

    it(`serializes ${path.basename(file)}`, (done) => {
      let serializedRefract;
      let expectedBlueprint;
      let refract;

      try {
        serializedRefract = require(file);
        expectedBlueprint = fs.readFileSync(apib, 'utf-8');
        refract = fury.load(serializedRefract);
      } catch (loadErr) {
        return done(loadErr);
      }

      adapter.serialize({api: refract}, (serializeErr, serialized) => {
        if (serializeErr) { return done(serializeErr); }
        expect(expectedBlueprint.trim()).to.deep.equal(serialized.trim());
        done();
      });
    });
  });
});
