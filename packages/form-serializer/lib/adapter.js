const serializeForm = require('./serializeForm');

const name = 'form';
const mediaTypes = ['multipart/form-data', 'application/x-www-form-urlencoded'];

function serialize({ api, mediaType, sync }) {
  if (sync) {
    return serializeForm({ api, mediaType });
  }

  return new Promise(resolve => resolve(serializeForm({ api, mediaType })));
}

module.exports = { name, mediaTypes, serialize };
