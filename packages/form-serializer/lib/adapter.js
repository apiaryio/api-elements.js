const serializeForm = require('./serializeForm');

const name = 'form';
const mediaTypes = ['multipart/form-data'];

function serialize({ api }) {
  return new Promise(resolve => resolve(serializeForm({ api })));
}

module.exports = { name, mediaTypes, serialize };
