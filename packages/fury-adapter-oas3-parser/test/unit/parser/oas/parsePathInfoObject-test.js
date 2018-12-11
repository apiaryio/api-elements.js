const { expect } = require('chai');
const { Fury } = require('fury');

const parse = require('../../../../lib/parser/oas/parsePathItemObject');

const { minim } = new Fury();

describe('#parsePathItemObject', () => {
  it('parses a path into a resource', () => {
    const path = new minim.elements.Member('/', {});
    const result = parse(minim, path);

    expect(result.length).to.equal(1);
    expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
    expect(result.get(0).href.toValue()).to.equal('/');
  });

  it('parses a path methods into a resource and transactions', () => {
    const path = new minim.elements.Member('/', {
      get: {},
    });
    const result = parse(minim, path);

    expect(result.length).to.equal(1);

    const resource = result.get(0);
    expect(resource).to.be.instanceof(minim.elements.Resource);
    expect(resource.href.toValue()).to.equal('/');
    expect(resource.length).to.equal(1);

    const transition = resource.get(0);
    expect(transition).to.be.instanceof(minim.elements.Transition);
    expect(transition.method.toValue()).to.equal('GET');
  });

  it('provides a warning when the path item object is non-object', () => {
    const path = new minim.elements.Member('/', null);
    const result = parse(minim, path);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Path Item Object' is not an object");
  });

  describe('warnings for keys', () => {
    it('warns for $ref', () => {
      const path = new minim.elements.Member('/', {
        $ref: '',
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' contains unsupported key '$ref'");
    });

    it('warns for a servers', () => {
      const path = new minim.elements.Member('/', {
        servers: '',
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' contains unsupported key 'servers'");
    });

    it('does not provide warning for Info Object extensions', () => {
      const path = new minim.elements.Member('/', {
        'x-extension': '',
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
    });

    it('provides warning for invalid keys', () => {
      const path = new minim.elements.Member('/', {
        invalid: '',
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' contains invalid key 'invalid'");
    });
  });

  describe('#summary', () => {
    it('warns when summary is not a string', () => {
      const path = new minim.elements.Member('/', {
        summary: 1,
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' 'summary' is not a string");
    });

    it('exposes summary as the title of the resource', () => {
      const path = new minim.elements.Member('/', {
        summary: 'Root',
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).title.toValue()).to.equal('Root');
    });
  });

  describe('#description', () => {
    it('exposes description as a copy element in the resource', () => {
      const path = new minim.elements.Member('/', {
        description: 'This is a resource',
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).copy.toValue()).to.deep.equal(['This is a resource']);
    });

    it('warns when description is not a string', () => {
      const path = new minim.elements.Member('/', {
        description: 1,
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).length).to.equal(0);

      expect(result).to.contain.warning("'Path Item Object' 'description' is not a string");
    });
  });

  describe('#parameters', () => {
    it('warns when parameters is not an array', () => {
      const path = new minim.elements.Member('/', {
        parameters: {},
      });

      const result = parse(minim, path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(minim.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' 'parameters' is not an array");
    });

    describe('path parameters', () => {
      it('exposes parameter in hrefVariables', () => {
        const path = new minim.elements.Member('/{resource}', {
          parameters: [
            {
              name: 'resource',
              in: 'path',
            },
          ],
        });

        const result = parse(minim, path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);

        const resource = result.get(0);
        expect(resource.hrefVariables).to.be.instanceof(minim.elements.HrefVariables);
        expect(resource.hrefVariables.length).to.equal(1);
        expect(resource.hrefVariables.getMember('resource')).to.be.instanceof(minim.elements.Member);
      });

      it('errors when parameter is not found in path', () => {
        const path = new minim.elements.Member('/', {
          parameters: [
            {
              name: 'resource',
              in: 'path',
            },
          ],
        });

        const result = parse(minim, path);

        expect(result.length).to.equal(1);
        expect(result).to.contain.error("Path '/' is missing path variable 'resource'. Add '{resource}' to the path");
      });

      it('errors when path variable not defined in parameters', () => {
        const path = new minim.elements.Member('/{resource}', {});

        const result = parse(minim, path);

        expect(result.length).to.equal(1);
        expect(result).to.contain.error("Path '/{resource}' contains variable 'resource' which is not declared in the parameters section of the 'Path Item Object'");
      });
    });

    describe('query parameters', () => {
      it('exposes query parameter in href', () => {
        const path = new minim.elements.Member('/', {
          parameters: [
            {
              name: 'categories',
              in: 'query',
            },
          ],
        });

        const result = parse(minim, path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);

        const resource = result.get(0);
        expect(resource.href.toValue()).to.equal('/{?categories}');
      });

      it('exposes multiple query parameter in href', () => {
        const path = new minim.elements.Member('/', {
          parameters: [
            {
              name: 'categories',
              in: 'query',
            },
            {
              name: 'tags',
              in: 'query',
            },
          ],
        });

        const result = parse(minim, path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);

        const resource = result.get(0);
        expect(resource.href.toValue()).to.equal('/{?categories,tags}');
      });

      it('exposes query parameter in hrefVariables', () => {
        const path = new minim.elements.Member('/', {
          parameters: [
            {
              name: 'resource',
              in: 'query',
            },
          ],
        });

        const result = parse(minim, path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(minim.elements.Resource);

        const resource = result.get(0);
        expect(resource.hrefVariables).to.be.instanceof(minim.elements.HrefVariables);
        expect(resource.hrefVariables.length).to.equal(1);
        expect(resource.hrefVariables.getMember('resource')).to.be.instanceof(minim.elements.Member);
      });
    });
  });
});
