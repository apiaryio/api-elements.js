import {expect} from 'chai';
import {Fury} from '../src/fury';

describe('Validation', () => {
  context('with a validate adapter', () => {
    let shouldDetect;
    let result;

    const fury = new Fury();

    fury.use({
      name: 'passthrough',
      mediaTypes: ['text/vnd.passthrough'],
      detect: () => shouldDetect,
      validate: ({}, done) => done(null, result),
    });

    beforeEach(() => {
      shouldDetect = false;
      result = null;
    });

    it('should validate through mediatype', (done) => {
      fury.validate({source: 'dummy', mediaType: 'text/vnd.passthrough'}, (err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.null;
        done();
      });
    });

    it('should validate through autodetect', (done) => {
      shouldDetect = true;

      fury.validate({source: 'dummy'}, (err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.null;
        done();
      });
    });

    it('should error when validating with no matching validator', (done) => {
      fury.validate({source: 'dummy'}, (err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.be.null;
        done();
      });
    });

    it('should convert an object parse result into minim elements', (done) => {
      shouldDetect = true;
      result = {
        'element': 'parseResult',
        'content': [
          {
            'element': 'annotation',
            'meta': {'classes': ['warning']},
            'content': 'a wild warning appeared',
          },
        ],
      };

      fury.validate({source: 'dummy'}, (err, res) => {
        expect(err).to.be.null;
        expect(res.toRefract()).to.deep.equal({
          'element': 'parseResult',
          'meta': {},
          'attributes': {},
          'content': [
            {
              'element': 'annotation',
              'meta': {'classes': ['warning']},
              'attributes': {},
              'content': 'a wild warning appeared',
            },
          ],
        });
        done();
      });
    });

    it('should pass adapter options during validation', (done) => {
      shouldDetect = true;
      fury.adapters[0].validate = ({minim, source, testOption = false}, cb) => {
        const BooleanElement = minim.getElementClass('boolean');
        return cb(null, new BooleanElement(testOption));
      };

      fury.validate({source: 'dummy', adapterOptions: {testOption: true}}, (err, res) => {
        expect(err).to.be.null;
        expect(res.content).to.be.true;
        done();
      });
    });
  });

  context('with a parse adapter without validate', () => {
    let result = null;
    const fury = new Fury();

    fury.use({
      name: 'passthrough',
      mediaTypes: ['text/vnd.passthrough'],
      detect: ({}) => true,
      parse: ({}, done) => done(null, result),
    });

    before(() => {
      result = null;
    });

    it('should validate when there are no annotations', (done) => {
      result = {
        'element': 'parseResult',
        'content': [
          {
            'element': 'category',
            'meta': {'classes': ['api']},
            'content': [],
          },
        ],
      };

      fury.validate({source: 'dummy', mediaType: 'text/vnd.passthrough'}, (err, res) => {
        expect(err).to.be.null;
        expect(res).to.be.null;
        done();
      });
    });

    it('should validate when there are annotations', (done) => {
      result = {
        'element': 'parseResult',
        'content': [
          {
            'element': 'category',
            'meta': {'classes': ['api']},
            'content': [],
          },
          {
            'element': 'annotation',
            'meta': {'classes': ['warning']},
            'content': 'a wild warning appeared',
          },
        ],
      };

      fury.validate({source: 'dummy', mediaType: 'text/vnd.passthrough'}, (err, res) => {
        expect(err).to.be.null;
        expect(res.toRefract()).to.deep.equal({
          'element': 'parseResult',
          'meta': {},
          'attributes': {},
          'content': [
            {
              'element': 'annotation',
              'meta': {'classes': ['warning']},
              'attributes': {},
              'content': 'a wild warning appeared',
            },
          ],
        });

        done();
      });
    });
  });
});
