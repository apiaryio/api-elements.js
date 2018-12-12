/* eslint-disable no-unused-expressions */
/*
 * Tests for Swagger adapter.
 */

import fury from 'fury';
import { expect } from 'chai';
import adapter from '../src/adapter';

fury.adapters = [adapter];

function doParse(source, done, expectations) {
  fury.parse({ source }, (err, output) => {
    if (err) {
      return done(err);
    }

    const { resources } = output.content[0];

    expect(resources.length).to.be.equal(1);
    expect(resources.get(0).transitions.get(0).length).to.be.equal(1);
    expect(resources.get(0).transitions.get(0).transactions.length).to.be.equal(1);

    const result = {
      result: output,
      resource: resources.get(0),
      transition: resources.get(0).transitions.get(0),
      transaction: resources.get(0).transitions.get(0).transactions.get(0),
      request: resources.get(0).transitions.get(0).transactions.get(0).request,
    };

    expectations(result);

    return done();
  });
}

function makeParameter(aName, aIn, aValue) {
  const parameter = {
    name: aName,
    in: aIn,
    description: 'description',
    required: true,
  };


  if (aIn === 'body') {
    if (aValue !== undefined) {
      parameter.schema = aValue;
    } else {
      parameter.schema = { type: 'string' };
    }
  } else {
    parameter.type = 'string';

    if (aValue !== undefined) {
      if (aIn === 'formData') {
        parameter.enum = [aValue];
      } else {
        parameter['x-example'] = aValue;
      }
    }
  }

  return parameter;
}

function makeSource(aPath, aOperation) {
  const operation = aOperation || 'get';
  const path = {
    parameters: [],
    [operation]: {
      parameters: [],
      responses: {
        200: {
          description: 'Example Response',
          schema: {
            type: 'object',
          },
        },
      },
    },
  };

  const source = {
    swagger: '2.0',
    info: {
      title: 'Test',
      version: '1.0',
    },
    paths: {
    },
  };

  source.paths[aPath] = path;

  return source;
}


describe('Inherit Path Parameters', () => {
  context('Query Parameter', () => {
    it('on Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].get.parameters.push(makeParameter('test', 'query'));

      doParse(source, done, (result) => {
        expect(result.resource.href.toValue()).to.be.equal('/');
        expect(result.transition.href.toValue()).to.be.equal('/{?test}');
      });
    });

    it('on Path', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'query'));

      doParse(source, done, (result) => {
        expect(result.resource.href.toValue()).to.be.equal('/{?test}');
        expect(result.transition.href).to.not.exist;
      });
    });

    it('on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'query'));
      source.paths['/'].get.parameters.push(makeParameter('foo', 'query'));

      doParse(source, done, (result) => {
        expect(result.resource.href.toValue()).to.be.equal('/{?test}');
        expect(result.transition.href.toValue()).to.be.equal('/{?test,foo}');
      });
    });

    it('on Path and Operation same parameter', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'query'));
      source.paths['/'].get.parameters.push(makeParameter('test', 'query'));

      doParse(source, done, (result) => {
        expect(result.resource.href.toValue()).to.be.equal('/{?test}');
        expect(result.transition.href).to.not.exist;
      });
    });
  });

  context('Path Parameter', () => {
    it('on Path', (done) => {
      const source = makeSource('/{test}');
      source.paths['/{test}'].parameters.push(makeParameter('test', 'path'));

      doParse(source, done, (result) => {
        expect(result.resource.href.toValue()).to.be.equal('/{test}');
        expect(result.resource.hrefVariables.keys()).to.deep.equal(['test']);

        expect(result.transition.href).to.not.exist;
        expect(result.transition.hrefVariables).to.not.exist;
      });
    });

    it('on Operation', (done) => {
      const source = makeSource('/{test}');
      source.paths['/{test}'].get.parameters.push(makeParameter('test', 'path'));

      doParse(source, done, (result) => {
        expect(result.resource.href.toValue()).to.be.equal('/{test}');
        expect(result.resource.hrefVariables).to.not.exist;

        expect(result.transition.href).to.not.exist;
        expect(result.transition.hrefVariables.keys()).to.deep.equal(['test']);
      });
    });

    it('on Path and Operation', (done) => {
      const source = makeSource('/{test}');
      source.paths['/{test}'].parameters.push(makeParameter('test', 'path'));
      source.paths['/{test}'].get.parameters.push(makeParameter('test', 'path'));

      doParse(source, done, (result) => {
        expect(result.resource.href.toValue()).to.be.equal('/{test}');
        expect(result.transition.href).to.not.exist;

        expect(result.resource.hrefVariables.keys()).to.deep.equal(['test']);
        expect(result.transition.hrefVariables.keys()).to.deep.equal(['test']);
      });
    });
  });

  context('Header Parameter', () => {
    it('on Path', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'header'));

      doParse(source, done, (result) => {
        expect(result.request.header('test')).to.exist;
      });
    });

    it('on Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].get.parameters.push(makeParameter('test', 'header'));

      doParse(source, done, (result) => {
        expect(result.request.header('test')).to.exist;
      });
    });

    it('on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'header'));
      source.paths['/'].get.parameters.push(makeParameter('foo', 'header'));

      doParse(source, done, (result) => {
        expect(result.request.header('test')).to.exist;
        expect(result.request.header('foo')).to.exist;
      });
    });

    it('same on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'header', 'foo'));
      source.paths['/'].get.parameters.push(makeParameter('test', 'header', 'bar'));

      doParse(source, done, (result) => {
        expect(result.request.header('test')).to.exist;
        expect(result.request.header('test')[0].toValue()).to.deep.equal('bar');
      });
    });
  });

  context('Body Parameter', () => {
    it('on Path', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'body'));

      doParse(source, done, (result) => {
        const schema = JSON.stringify(source.paths['/'].parameters[0].schema);

        // ensure there is no warning about unsupported "Path-level Body Parameter")
        expect(result.result.annotations.toValue()).to.be.empty;
        expect(result.request.messageBodySchema.content).to.equal(schema);
      });
    });

    it('on Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].get.parameters.push(makeParameter('test', 'body'));

      doParse(source, done, (result) => {
        const schema = JSON.stringify(source.paths['/'].get.parameters[0].schema);

        expect(result.request.messageBodySchema.content).to.equal(schema);
      });
    });

    it('on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'body'));
      source.paths['/'].get.parameters.push(makeParameter('foo', 'body'));

      doParse(
        source,
        (err) => {
          expect(err.message).to.equal('Validation failed. /paths//get has 2 body parameters. Only one is allowed.');
          done();
        },
        () => {},
      );
    });

    it('on Path and Operation is same Parameter', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'body', { type: 'string' }));
      source.paths['/'].get.parameters.push(makeParameter('test', 'body', { type: 'number' }));

      doParse(source, done, (result) => {
        expect(result.request.messageBodySchema.content).to
          .equal(JSON.stringify(source.paths['/'].get.parameters[0].schema));
      });
    });
  });

  context('FormData Parameter with Get', () => {
    it('on Path', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'formData'));

      doParse(source, done, (result) => {
        expect(result.request.dataStructure.toValue()).to.deep.equal({ test: null });

        // ensure there is no warning about unsupported "Path-level formData Parameter")
        expect(result.result.annotations.toValue()).to.be.empty;
      });
    });

    it('on Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].get.parameters.push(makeParameter('test', 'formData'));

      doParse(source, done, (result) => {
        expect(result.request.dataStructure.toValue()).to.deep.equal({ test: null });
      });
    });

    it('on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'formData'));
      source.paths['/'].get.parameters.push(makeParameter('foo', 'formData'));

      doParse(source, done, (result) => {
        expect(result.request.dataStructure.toValue()).to.deep.equal({ foo: null, test: null });
      });
    });

    it('on Path and Operation is same Parameter', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'formData', 'body'));
      source.paths['/'].get.parameters.push(makeParameter('test', 'formData', 'op'));

      doParse(source, done, (result) => {
        expect(result.request.dataStructure.toValue()).to.deep.equal({ test: null });

        // ensure there is no warning about unsupported "Path-level formData Parameter")
        expect(result.result.annotations.toValue()).to.be.empty;
      });
    });
  });
});
