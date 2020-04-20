const serializeJSON = require('./serializeJSON');

const name = 'json';
const mediaTypes = [
  'application/json',
];

function serialize({ api }) {
  return new Promise(resolve => resolve(serializeJSON(api)));
}

module.exports = { name, mediaTypes, serialize };
