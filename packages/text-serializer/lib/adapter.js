const serializeText = require('./serializeText');

const name = 'text';
const mediaTypes = [
  'text/plain',
];

function serialize({ api }) {
  return new Promise(resolve => resolve(serializeText(api)));
}

function serializeSync({ api }) {
  return serializeText(api);
}

module.exports = {
  name, mediaTypes, serialize, serializeSync,
};
