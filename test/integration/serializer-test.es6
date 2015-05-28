import {assert} from 'chai';
import fs from 'fs';
import glob from 'glob';
import fury from '../../lib/fury';
import path from 'path';

const base = path.join(__dirname, 'serializers');

describe('Serializers', () => {
  const files = glob.sync(path.join(base, '*.json'));

  files.forEach((file) => {
    describe(path.basename(file), () => {
      const apib = file.substr(0, file.length - 4) + 'apib';

      if (fs.existsSync(apib)) {
        it('should convert to API Blueprint', (done) => {
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

          fury.serialize({api: refract, mediaType: 'text/vnd.apiblueprint'}, (serializeErr, serialized) => {
            if (serializeErr) { return done(serializeErr); }
            assert.deepEqual(expectedBlueprint.trim(), serialized.trim());
            done();
          });
        });
      }
    });
  });
});
