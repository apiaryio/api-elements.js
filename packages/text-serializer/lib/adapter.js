const serializeText = require('./serializeText');

const name = 'text';
const mediaTypes = [
  'text/plain',
];

function serialize({ api }) {
  return new Promise((resolve, reject) => {
    const done = (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    };

    serializeText(api, done);
  });
}

function serializeSync({ api }) {
  const done = (error, result) => {
    if (error) {
      throw error;
    } else {
      return result;
    }
  };

  return serializeText(api, done);
}

module.exports = {
  name, mediaTypes, serialize, serializeSync,
};
