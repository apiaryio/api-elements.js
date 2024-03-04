const { expect } = require('chai');
const { Fury } = require('fury');

const serializeHrefVariables = require('../../../lib/serialize/serializeHrefVariables');

const namespace = new Fury().minim;

describe('#serializeHrefVariables', () => {
  it('converts path hrefVariables to parameters', () => {
    const href = new namespace.elements.String('/users/{username}');
    const hrefVariables = new namespace.elements.HrefVariables([
      new namespace.elements.Member('username'),
    ]);

    const parameters = serializeHrefVariables(href, hrefVariables);
    expect(parameters).to.deep.equal([
      {
        name: 'username',
        in: 'path',
      },
    ]);
  });

  it('converts query hrefVariables to parameters', () => {
    const href = new namespace.elements.String('/list/{?tags}');
    const hrefVariables = new namespace.elements.HrefVariables([
      new namespace.elements.Member('tags'),
    ]);

    const parameters = serializeHrefVariables(href, hrefVariables);
    expect(parameters).to.deep.equal([
      {
        name: 'tags',
        in: 'query',
      },
    ]);
  });
});
