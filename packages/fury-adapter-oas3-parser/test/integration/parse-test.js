const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { Fury } = require('fury');
const adapter = require('../../lib/adapter');

// FIXME use `util`.`promisify` for Node 8+ or https://github.com/apiaryio/api-elements.js/issues/37
function promisify(func) {
  return (...args) => new Promise((resolve, reject) => {
    func(...args, (error, result) => {
      if (error) {
        return reject(error);
      }

      return resolve(result);
    });
  });
}

const fury = new Fury();
fury.use(adapter);

const { minim: namespace } = fury;

describe('#parse', () => {
  const parse = promisify(fury.parse.bind(fury));

  it('can parse petstore example', () => {
    const file = path.join(__dirname, 'fixtures', 'petstore');
    const source = fs.readFileSync(`${file}.yaml`, 'utf-8');

    return parse({ source }).then((parseResult) => {
      expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);

      // Freeze elements to ensure there is no duplicate elements in tree,
      // or any elements from the YAML parser is cloned.
      parseResult.freeze();

      const result = JSON.stringify(namespace.serialiser.serialise(parseResult), null, 2);

      if (process.env.GENERATE) {
        fs.writeFileSync(`${file}.json`, result);
      }

      const expected = fs.readFileSync(`${file}.json`, 'utf-8');
      expect(result).to.equal(expected);
    });
  });
});
