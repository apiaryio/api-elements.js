const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { expect } = require('chai');
const { Fury } = require('fury');
const adapter = require('../../lib/adapter');

const fury = new Fury();
fury.use(adapter);

describe('#parse', () => {
  const parse = promisify(fury.parse.bind(fury));

  it('can parse petstore example', async () => {
    const file = path.join(__dirname, 'fixtures', 'petstore');
    const source = fs.readFileSync(`${file}.yaml`, 'utf-8');

    const parseResult = await parse({ source });
    expect(parseResult).to.be.instanceof(fury.minim.elements.ParseResult);

    const result = JSON.stringify(fury.minim.serialiser.serialise(parseResult), null, 2);
    const expected = fs.readFileSync(`${file}.json`, 'utf-8');
    expect(result).to.equal(expected);
  });
});
