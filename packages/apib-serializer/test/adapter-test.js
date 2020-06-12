/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/*
 * Tests for API Blueprint serializer.
 */

const { expect } = require('chai');
const fs = require('fs');
const { Fury } = require('@apielements/core');
const glob = require('glob');
const path = require('path');
const adapter = require('../lib/adapter');
const { indent } = require('../lib/filters');

const base = path.join(__dirname, 'fixtures');

const fury = new Fury();
fury.use(adapter);

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
        ({ api } = parseResult);
      } catch (loadErr) {
        return done(loadErr);
      }

      return fury.serialize({ api }, (serializeErr, serialized) => {
        if (serializeErr) {
          return done(serializeErr);
        }

        expect(serialized).to.deep.equal(expectedBlueprint);
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
