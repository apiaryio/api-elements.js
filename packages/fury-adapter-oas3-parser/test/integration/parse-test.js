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

  it('can parse petstore example', () => {
    const file = path.join(__dirname, 'fixtures', 'petstore');
    const source = fs.readFileSync(`${file}.yaml`, 'utf-8');

    return parse({ source }).then((parseResult) => {
      expect(parseResult).to.be.instanceof(fury.minim.elements.ParseResult);

      const result = JSON.stringify(fury.minim.serialiser.serialise(parseResult), null, 2);

      if (process.env.GENERATE) {
        fs.writeFileSync(`${file}.json`, result);
      }

      const expected = fs.readFileSync(`${file}.json`, 'utf-8');
      expect(result).to.equal(expected);
    });
  });
});
