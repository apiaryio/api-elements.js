import {expect} from 'chai';
import glob from 'glob';
import path from 'path';
import fs from 'fs';

import adapter from '../src/adapter';
import fury from 'fury';

fury.adapters = [adapter];

describe('Apiary Blueprint Parser', () => {
  const filenames = glob.sync(path.join(__dirname, 'fixtures', '*.txt'));

  for (const filename of filenames) {
    const name = path.basename(filename, path.extname(filename));
    const elementsFilename = path.join(__dirname, 'fixtures', `${name}.json`);

    /* eslint-disable no-loop-func */
    it(`can parse ${name} fixture`, (done) => {
      const source = fs.readFileSync(filename, 'utf8');
      let expected = require(elementsFilename);

      fury.parse({source}, (err, output) => {
        if (err) {
          expect(err).to.be.undefined();
          return done(err);
        }

        if (process.env.GENERATE) {
          expected = output.toRefract();
          fs.writeFileSync(path.join(elementsFilename), JSON.stringify(expected, null, 2), 'utf8');
        }

        expect(output.toRefract()).to.deep.equal(expected);
        done();
      });
    });
    /* eslint-enable no-loop-func */
  }
});
