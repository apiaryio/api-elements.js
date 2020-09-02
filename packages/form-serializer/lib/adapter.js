const serializeForm = require('./serializeForm');

const name = 'form';
const mediaTypes = ['multipart/form-data', 'application/x-www-form-urlencoded'];

function serialize({ api, mediaType }) {
  return new Promise(resolve => resolve(serializeForm({ api, mediaType })));
}

function serializeSync({ api, mediaType }) {
  return serializeForm({ api, mediaType });
}

module.exports = {
  name, mediaTypes, serialize, serializeSync,
};
