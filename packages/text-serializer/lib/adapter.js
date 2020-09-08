const serializeText = require('./serializeText');

const name = 'text';
const mediaTypes = [
  'text/plain',
];

function serialize({ api }) {
  return new Promise((resolve, reject) => {
    const done = (err, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    };

    serializeText(api, done);
  });
}

function serializeSync({ api }) {
  const done = (err, body) => {
    if (err) {
      throw err;
    } else {
      return body;
    }
  };

  return serializeText(api, done);
}

module.exports = {
  name, mediaTypes, serialize, serializeSync,
};
