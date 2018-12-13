/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/*
 * Tests for API Blueprint serializer.
 */

const { expect } = require('chai');
const fs = require('fs');
const fury = require('fury');
const glob = require('glob');
const path = require('path');
const { serialize } = require('../lib/adapter');
const { indent } = require('../lib/filters');

const base = path.join(__dirname, 'fixtures');

describe('API Blueprint serializer adapter', () => {
  const files = glob.sync(path.join(base, '*.json'));

  files.forEach((file) => {
    const apib = `${file.substr(0, file.length - 4)}apib`;

    it(`serializes ${path.basename(file)}`, (done) => {
      let serializedRefract;
      let expectedBlueprint;
      let api;

      try {
        serializedRefract = require(file);
        expectedBlueprint = fs.readFileSync(apib, 'utf-8');

        const parseResult = fury.load(serializedRefract);
        api = parseResult.api;
      } catch (loadErr) {
        return done(loadErr);
      }

      return serialize({ api }, (serializeErr, serialized) => {
        if (serializeErr) {
          return done(serializeErr);
        }

        expect(serialized.trim()).to.deep.equal(expectedBlueprint.trim());
        return done();
      });
    });
  });
});

describe('Indent filter', () => {
  const lines = indent('1\n2', 2, { first: true });

  it('indents the first line', () => {
    expect(lines).to.equal('  1\n  2');
  });
});
