const parser = require('./parser');

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
  const parseResult = parser(options.source, options.minim);
  cb(null, parseResult);
}

module.exports = { name, mediaTypes, detect, parse };
