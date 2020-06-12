/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { expect } = require('chai');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const fury = require('@apielements/core');
const adapter = require('../lib/adapter');

fury.adapters = [adapter];

describe('Apiary Blueprint Parser', () => {
  const filenames = glob.sync(path.join(__dirname, 'fixtures', '*.txt'));

  filenames.forEach((filename) => {
    const name = path.basename(filename, path.extname(filename));
    const elementsFilename = path.join(__dirname, 'fixtures', `${name}.json`);

    it(`can parse ${name} fixture`, (done) => {
      const source = fs.readFileSync(filename, 'utf8');
      let expected = require(elementsFilename);

      fury.parse({ source }, (err, output) => {
        if (err) {
          expect(err).to.be.undefined();
          return done(err);
        }

        if (process.env.GENERATE) {
          expected = fury.minim.toRefract(output);
          fs.writeFileSync(path.join(elementsFilename), JSON.stringify(expected, null, 2), 'utf8');
        }

        expect(fury.minim.toRefract(output)).to.deep.equal(expected);
        return done();
      });
    });
  });
});
