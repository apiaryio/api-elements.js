const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parsePathItemObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parsePathItemObject', () => {
  it('parses a path into a resource', () => {
    const path = new namespace.elements.Member('/', {});
    const result = parse(new Context(namespace), path);

    expect(result.length).to.equal(1);
    expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
    expect(result.get(0).href.toValue()).to.equal('/');
  });

  it('parses a path methods into a resource and transactions', () => {
    const path = new namespace.elements.Member('/', {
      get: {
        responses: {
          200: {},
        },
      },
    });
    const result = parse(new Context(namespace), path);

    expect(result.length).to.equal(1);

    const resource = result.get(0);
    expect(resource).to.be.instanceof(namespace.elements.Resource);
    expect(resource.href.toValue()).to.equal('/');
    expect(resource.length).to.equal(1);

    const transition = resource.get(0);
    expect(transition).to.be.instanceof(namespace.elements.Transition);
    expect(transition.method.toValue()).to.equal('GET');
  });

  it('provides a warning when the path item object is non-object', () => {
    const path = new namespace.elements.Member('/', null);
    const result = parse(new Context(namespace), path);

    expect(result.length).to.equal(1);
    expect(result).to.contain.warning("'Path Item Object' is not an object");
  });

  describe('warnings for keys', () => {
    it('warns for $ref', () => {
      const path = new namespace.elements.Member('/', {
        $ref: '',
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' contains unsupported key '$ref'");
    });

    it('warns for a servers', () => {
      const path = new namespace.elements.Member('/', {
        servers: '',
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' contains unsupported key 'servers'");
    });

    it('does not provide warning for Info Object extensions', () => {
      const path = new namespace.elements.Member('/', {
        'x-extension': '',
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
    });

    it('provides warning for invalid keys', () => {
      const path = new namespace.elements.Member('/', {
        invalid: '',
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' contains invalid key 'invalid'");
    });
  });

  describe('#summary', () => {
    it('warns when summary is not a string', () => {
      const path = new namespace.elements.Member('/', {
        summary: 1,
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' 'summary' is not a string");
    });

    it('exposes summary as the title of the resource', () => {
      const path = new namespace.elements.Member('/', {
        summary: 'Root',
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).title.toValue()).to.equal('Root');
    });
  });

  describe('#description', () => {
    it('exposes description as a copy element in the resource', () => {
      const path = new namespace.elements.Member('/', {
        description: 'This is a resource',
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(1);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).copy.toValue()).to.deep.equal(['This is a resource']);
    });

    it('warns when description is not a string', () => {
      const path = new namespace.elements.Member('/', {
        description: 1,
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).length).to.equal(0);

      expect(result).to.contain.warning("'Path Item Object' 'description' is not a string");
    });
  });

  describe('#parameters', () => {
    it('warns when parameters is not an array', () => {
      const path = new namespace.elements.Member('/', {
        parameters: {},
      });

      const result = parse(new Context(namespace), path);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);
      expect(result.get(0).href.toValue()).to.equal('/');

      expect(result).to.contain.warning("'Path Item Object' 'parameters' is not an array");
    });

    describe('path parameters', () => {
      it('exposes parameter in hrefVariables', () => {
        const path = new namespace.elements.Member('/{resource}', {
          parameters: [
            {
              name: 'resource',
              in: 'path',
            },
          ],
        });

        const result = parse(new Context(namespace), path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);

        const resource = result.get(0);
        expect(resource.hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
        expect(resource.hrefVariables.length).to.equal(1);
        expect(resource.hrefVariables.getMember('resource')).to.be.instanceof(namespace.elements.Member);
      });

      it('errors when parameter is not found in path', () => {
        const path = new namespace.elements.Member('/', {
          parameters: [
            {
              name: 'resource',
              in: 'path',
            },
          ],
        });

        const result = parse(new Context(namespace), path);

        expect(result.length).to.equal(1);
        expect(result).to.contain.error("Path '/' is missing path variable 'resource'. Add '{resource}' to the path");
      });

      it('errors when path variable not defined in parameters', () => {
        const path = new namespace.elements.Member('/{resource}', {});

        const result = parse(new Context(namespace), path);

        expect(result.length).to.equal(1);
        expect(result).to.contain.error("Path '/{resource}' contains variable 'resource' which is not declared in the parameters section of the 'Path Item Object'");
      });
    });

    describe('query parameters', () => {
      it('exposes query parameter in href', () => {
        const path = new namespace.elements.Member('/', {
          parameters: [
            {
              name: 'categories',
              in: 'query',
            },
          ],
        });

        const result = parse(new Context(namespace), path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);

        const resource = result.get(0);
        expect(resource.href.toValue()).to.equal('/{?categories}');
      });

      it('exposes multiple query parameter in href', () => {
        const path = new namespace.elements.Member('/', {
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

        const result = parse(new Context(namespace), path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);

        const resource = result.get(0);
        expect(resource.href.toValue()).to.equal('/{?categories,tags}');
      });

      it('exposes query parameter in hrefVariables', () => {
        const path = new namespace.elements.Member('/', {
          parameters: [
            {
              name: 'resource',
              in: 'query',
            },
          ],
        });

        const result = parse(new Context(namespace), path);

        expect(result.length).to.equal(1);
        expect(result.get(0)).to.be.instanceof(namespace.elements.Resource);

        const resource = result.get(0);
        expect(resource.hrefVariables).to.be.instanceof(namespace.elements.HrefVariables);
        expect(resource.hrefVariables.length).to.equal(1);
        expect(resource.hrefVariables.getMember('resource')).to.be.instanceof(namespace.elements.Member);
      });
    });
  });
});
