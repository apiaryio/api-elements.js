const yaml = require('js-yaml');
const serializeApi = require('./serialize/serializeApi');

const name = 'openapi3';
const openApiMediaType = 'application/vnd.oai.openapi';
const openApiJsonMediaType = 'application/vnd.oai.openapi+json';

// Per https://github.com/OAI/OpenAPI-Specification/issues/110#issuecomment-364498200
const mediaTypes = [
  openApiMediaType,
  openApiJsonMediaType,
];

function serialize({ api, mediaType }) {
  return new Promise((resolve, reject) => {
    const document = serializeApi(api);


    if (mediaType === openApiMediaType) {
      resolve(yaml.dump(document));
    } else if (mediaType === openApiJsonMediaType) {
      resolve(JSON.stringify(document));
    } else {
      reject(new Error(`Unsupported media type ${mediaType}`));
    }
  });
}

module.exports = { name, mediaTypes, serialize };
