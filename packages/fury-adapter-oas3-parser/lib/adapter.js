const parser = require('./parser');
const Context = require('./context');

const name = 'oas3';

// Per https://github.com/OAI/OpenAPI-Specification/issues/110#issuecomment-364498200
const mediaTypes = [
  'application/vnd.oai.openapi',
  'application/vnd.oai.openapi+json',
];

function detect(source) {
  return !!source.match(/"?openapi"?\s*:\s*["']3\.(\d+)\.(\d+)["']/g);
}

function parse(options, cb) {
  const ctxt = new Context(
    options.minim,
    {
      generateSourceMap: options.generateSourceMap,
    }
  );
  const parseResult = parser(options.source, ctxt);
  cb(null, parseResult);
}

module.exports = {
  name, mediaTypes, detect, parse,
};
