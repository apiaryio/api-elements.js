const serializeJSON = require('./serializeJSON');

const name = 'json';
const mediaTypes = [
  'application/json',
];

function serialize({ api }) {
  return new Promise(resolve => resolve(serializeJSON(api)));
}

function serializeSync({ api }) {
  return serializeJSON(api);
}

module.exports = {
  name, mediaTypes, serialize, serializeSync,
};
