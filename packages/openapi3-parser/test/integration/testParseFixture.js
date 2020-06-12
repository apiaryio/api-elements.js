const fs = require('fs');
const { expect } = require('chai');
const { Fury } = require('@apielements/core');
const adapter = require('../../lib/adapter');

// fixme use `util`.`promisify` for node 8+ or https://github.com/apiaryio/api-elements.js/issues/37
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
const parse = promisify(fury.parse.bind(fury));

function testParseFixture(file, generateSourceMap = false, generateMessageBody = true) {
  const source = fs.readFileSync(`${file}.yaml`, 'utf-8');

  return parse({ source, generateSourceMap, adapterOptions: { generateMessageBody } }).then((parseResult) => {
    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);

    // freeze elements to ensure there is no duplicate elements in tree,
    // or any elements from the yaml parser is cloned.
    parseResult.freeze();

    const result = JSON.stringify(namespace.serialiser.serialise(parseResult), null, 2);

    const expectedPath = `${file + (generateSourceMap ? '.sourcemap' : '')}.json`;

    if (process.env.GENERATE) {
      fs.writeFileSync(expectedPath, result);
    }

    const expected = fs.readFileSync(expectedPath, 'utf-8');
    expect(result).to.equal(expected, `Parse Result does not match '${expectedPath}' fixture`);
  });
}

module.exports = testParseFixture;
