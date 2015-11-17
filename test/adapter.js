/*
 * Tests for Swagger adapter.
 */

import adapter from '../src/adapter';
import fs from 'fs';
import fury from 'fury';
import path from 'path';

import {expect} from 'chai';

const FIXTURES = path.join(__dirname, 'fixtures');

fury.adapters = [adapter];

describe('Swagger 2.0 adapter', () => {
  context('detection', () => {
    it('detects JSON', () => {
      expect(adapter.detect('"swagger": "2.0"')).to.be.true;
    });

    it('detects YAML', () => {
      expect(adapter.detect('swagger: "2.0"')).to.be.true;
    });

    it('works with single quotes', () => {
      expect(adapter.detect('swagger: \'2.0\'')).to.be.true;
    });

    it('works with extra spacing', () => {
      expect(adapter.detect('swagger:  \t "2.0"')).to.be.true;
    });

    it('ignores other data', () => {
      expect(adapter.detect('{"title": "Not Swagger!"}')).to.be.false;
    });
  });

  context('can parse Swagger', () => {
    const source = fs.readFileSync(path.join(FIXTURES, 'swagger.json'), 'utf8');
    const refracted = require(path.join(FIXTURES, 'refract.json'));
    let result;

    before((done) => {
      fury.parse({source}, (err, output) => {
        if (err) {
          return done(err);
        }

        result = output;
        done();
      });
    });

    it('has parseResult element', () => {
      expect(result.element).to.equal('parseResult');
    });

    it('has API category inside parse result', () => {
      const filtered = result.filter(item =>
        item.element === 'category' && item.classes.contains('api')
      );

      expect(filtered).to.have.length(1);
      expect(filtered[0]).to.be.an.object;
    });

    it('equals expected refract', () => {
      expect(result.toRefract()).to.deep.equal(refracted);
    });
  });
});
