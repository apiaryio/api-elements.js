const { expect } = require('chai');
const { Fury } = require('fury');

const serializeResource = require('../../../lib/serialize/serializeResource');

const namespace = new Fury().minim;

describe('#serializeResource', () => {
  it('serializes empty API resources', () => {
    const resource = new namespace.elements.Resource();

    const document = serializeResource(resource);
    expect(document).to.deep.equal({});
  });

  it('serializes resource title as summary', () => {
    const resource = new namespace.elements.Resource();
    resource.title = 'User';

    const pathItem = serializeResource(resource);
    expect(pathItem.summary).to.equal('User');
  });

  it('serializes resource copy as summary', () => {
    const resource = new namespace.elements.Resource();
    resource.push(new namespace.elements.Copy('Hello'));
    resource.push(new namespace.elements.Copy('Another Copy'));

    const pathItem = serializeResource(resource);
    expect(pathItem.description).to.equal('Hello\n\nAnother Copy');
  });

  it('serializes hrefVariables as parameters', () => {
    const resource = new namespace.elements.Resource();
    resource.href = '/users/{username}{?tags}';
    resource.hrefVariables = new namespace.elements.HrefVariables();
    resource.hrefVariables.push(new namespace.elements.Member('username'));
    resource.hrefVariables.push(new namespace.elements.Member('tags'));

    const pathItem = serializeResource(resource);
    expect(pathItem.parameters).to.deep.equal([
      {
        name: 'username',
        in: 'path',
      },
      {
        name: 'tags',
        in: 'query',
      },
    ]);
  });

  it('serializes transition elements', () => {
    const request = new namespace.elements.HttpRequest();
    request.method = 'GET';
    const transaction = new namespace.elements.HttpTransaction([request]);

    const transition = new namespace.elements.Transition([transaction]);
    const resource = new namespace.elements.Resource([transition]);
    resource.href = '/';

    const pathItem = serializeResource(resource);
    expect(pathItem.get).to.deep.equal({
      responses: {},
    });
  });
});
