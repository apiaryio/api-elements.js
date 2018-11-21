const { expect } = require('chai');
const { Fury } = require('fury');

const parsePaths = require('../../lib/parser/paths');

const { minim } = new Fury();

describe('#parsePaths', () => {
  it('provides error when paths is non-object', () => {
    const paths = new minim.elements.String();

    const result = parsePaths(minim, paths);

    expect(result.length).to.equal(1);
    expect(result.errors.get(0).toValue()).to.equal("'Paths Object' is not an object");
  });

  it('returns empty parse result when paths is empty', () => {
    const paths = new minim.elements.Object();
    const result = parsePaths(minim, paths);

    expect(result.isEmpty).to.be.true;
  });

  it('provides a warning when paths contains non path field pattern', () => {
    const paths = new minim.elements.Object({
      test: {},
    });

    const result = parsePaths(minim, paths);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal("'Paths Object' contains invalid key 'test'");
  });

  it('ignores extension objects', () => {
    const paths = new minim.elements.Object({
      'x-extension': {},
    });

    const result = parsePaths(minim, paths);

    expect(result.isEmpty).to.be.true;
  });

  describe('Path Item Object', () => {
    it('provides a warning when the path item object is non-object', () => {
      const paths = new minim.elements.Object({
        '/': null,
      });

      const result = parsePaths(minim, paths);

      expect(result.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' is not an object");
    });

    it('parses a path into a resource', () => {
      const paths = new minim.elements.Object({
        '/': new minim.elements.Object(),
      });

      const result = parsePaths(minim, paths);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');
    });

    it('parses multiple path items into resources in defined order', () => {
      const paths = new minim.elements.Object({
        '/3': new minim.elements.Object(),
        '/1': new minim.elements.Object(),
        '/2': new minim.elements.Object(),
      });

      const result = parsePaths(minim, paths);

      expect(result.length).to.equal(3);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/3');

      expect(result.get(1)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(1).href.toValue()).to.equal('/1');

      expect(result.get(2)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(2).href.toValue()).to.equal('/2');
    });

    describe('warnings for keys', () => {
      it('warns for $ref', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            $ref: '',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(2);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).href.toValue()).to.equal('/');

        expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' contains unsupported key '$ref'");
      });

      it('warns for description', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            description: '',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(2);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).href.toValue()).to.equal('/');

        expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' contains unsupported key 'description'");
      });

      it('warns for a http method', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            get: '',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(2);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).href.toValue()).to.equal('/');

        expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' contains unsupported key 'get'");
      });

      it('warns for a servers', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            servers: '',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(2);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).href.toValue()).to.equal('/');

        expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' contains unsupported key 'servers'");
      });

      it('warns for a parameters', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            parameters: '',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(2);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).href.toValue()).to.equal('/');

        expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' contains unsupported key 'parameters'");
      });

      it('does not provide warning for Info Object extensions', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            'x-extension': '',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      });

      it('provides warning for invalid keys', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            invalid: '',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(2);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).href.toValue()).to.equal('/');

        expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' contains invalid key 'invalid'");
      });
    });

    describe('#summary', () => {
      it('warns when summary is not a string', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            summary: 1,
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(2);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).href.toValue()).to.equal('/');

        expect(result.warnings.get(0).toValue()).to.equal("'Path Item Object' 'summary' is not a string");
      });

      it('exposes summary as the title of the resource', () => {
        const paths = new minim.elements.Object({
          '/': new minim.elements.Object({
            summary: 'Root',
          }),
        });

        const result = parsePaths(minim, paths);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
        expect(result.get(0).title.toValue()).to.equal('Root');
      });
    });
  });
});
