/*
 * Tests for Swagger adapter.
 */

import adapter from '../src/adapter';
import fury from 'fury';

import {expect} from 'chai';

fury.adapters = [adapter];

function doParse(source, done, expectations) {
  fury.parse({source}, (err, output) => {
    if (err) {
      return done(err);
    }

    const resources = output.content[0].resources;

    expect(resources.length).to.be.equal(1);
    expect(resources.get(0).transitions.get(0).length).to.be.equal(1);
    expect(resources.get(0).transitions.get(0).transactions.length).to.be.equal(1);

    const result = {
      result: output,
      resource: resources.get(0),
      transition: resources.get(0).transitions.get(0),
      transaction: resources.get(0).transitions.get(0).transactions.get(0),
    };

    expectations(result);

    done();
  });
}

function makeParameter(aName, aIn, aValue) {
  const parameter = {
    name: aName,
    in: aIn,
    description: 'description',
    required: true,
  };

  if (aValue !== null) {
    parameter['x-example'] = aValue;
  }

  if (aIn === 'body') {
    parameter.schema = { type: 'string' };
  } else {
    parameter.type = 'string';
  }

  return parameter;
}

function makeSource(aPath) {
  const path = {
    parameters: [],
    get: {
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
        expect(result.resource.href).to.be.equal('/');
        expect(result.transition.href).to.be.equal('/{?test}');
      });
    });

    it('on Path', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'query'));

      doParse(source, done, (result) => {
        expect(result.resource.href).to.be.equal('/{?test}');
        expect(result.transition.href).to.not.exist;
      });
    });

    it('on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'query'));
      source.paths['/'].get.parameters.push(makeParameter('foo', 'query'));

      doParse(source, done, (result) => {
        expect(result.resource.href).to.be.equal('/{?test}');
        expect(result.transition.href).to.be.equal('/{?test,foo}');
      });
    });
  });

  context('Path Parameter', () => {
    it('on Path', (done) => {
      const source = makeSource('/{test}');
      source.paths['/{test}'].parameters.push(makeParameter('test', 'path'));

      doParse(source, done, (result) => {
        expect(result.resource.href).to.be.equal('/{test}');
        expect(result.resource.hrefVariables.keys()).to.deep.equal(['test']);

        expect(result.transition.href).to.not.exist;
        expect(result.transition.hrefVariables).to.not.exist;
      });
    });

    it('on Operation', (done) => {
      const source = makeSource('/{test}');
      source.paths['/{test}'].get.parameters.push(makeParameter('test', 'path'));

      doParse(source, done, (result) => {
        expect(result.resource.href).to.be.equal('/{test}');
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
        expect(result.resource.href).to.be.equal('/{test}');
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
        expect(result.transaction.request.header('test')).to.exist;
      });
    });

    it('on Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].get.parameters.push(makeParameter('test', 'header'));

      doParse(source, done, (result) => {
        // console.log(JSON.stringify(source, null, 2));
        // console.log(JSON.stringify(result.result.toRefract(), null, 2));
        expect(result.transaction.request.header('test')).to.exist;
      });
    });

    it('on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'header'));
      source.paths['/'].get.parameters.push(makeParameter('foo', 'header'));

      doParse(source, done, (result) => {
        expect(result.transaction.request.header('test')).to.exist;
        expect(result.transaction.request.header('foo')).to.exist;
      });
    });

    it('same on Path and Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'header', 'foo'));
      source.paths['/'].get.parameters.push(makeParameter('test', 'header', 'bar'));

      doParse(source, done, (result) => {
        expect(result.transaction.request.header('test')).to.exist;
        expect(result.transaction.request.header('test')).to.deep.equal(['bar']);
      });
    });
  });

  context.skip('Body Parameter', () => {
    it('on Path', (done) => {
      const source = makeSource('/');
      source.paths['/'].parameters.push(makeParameter('test', 'body'));
        // console.log(JSON.stringify(source, null, 2));

      doParse(source, done, (result) => {
        expect(result.transaction.request.messageBodySchema.content).to.equal(
            JSON.stringify(source.paths['/'].parameters[0].schema)
        );
      });
    });

    it('on Operation', (done) => {
      const source = makeSource('/');
      source.paths['/'].get.parameters.push(makeParameter('test', 'body'));

      doParse(source, done, (result) => {
        expect(result.transaction.request.messageBodySchema.content).to.equal(
            JSON.stringify(source.paths['/'].get.parameters[0].schema)
        );
      });
    });
  });
});
