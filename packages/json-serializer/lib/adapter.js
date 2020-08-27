const serializeJSON = require('./serializeJSON');

const name = 'json';
const mediaTypes = [
  'application/json',
];

function serialize({ api, sync }) {
  if (sync) {
    return serializeJSON(api);
  }

  return new Promise(resolve => resolve(serializeJSON(api)));
}

module.exports = { name, mediaTypes, serialize };
