const parser = require('./parser');
const Context = require('./context');

const name = 'oas3';

// Per https://github.com/OAI/OpenAPI-Specification/issues/110#issuecomment-364498200
const mediaTypes = [
  'application/vnd.oai.openapi',
  'application/vnd.oai.openapi+json',
];

function detect(source) {
  return !!source.match(/(["']?)openapi\1\s*:\s*(["']?)3\.\d+\.\d+\2/g);
}

function parse(options) {
  const context = new Context(
    options.namespace,
    {
      generateSourceMap: options.generateSourceMap,
    }
  );

  return new Promise((resolve, reject) => {
    let parseResult;

    try {
      parseResult = parser(options.source, context);
    } catch (error) {
      reject(error);
      return;
    }

    resolve(parseResult);
  });
}

module.exports = {
  name, mediaTypes, detect, parse,
};
