const _ = require('lodash');

function collectElementByIDs(element) {
  const dataStructures = {};

  if (typeof element.content === 'string') {
    dataStructures.undefined = element.content;
    return dataStructures;
  }

  const { parents } = element;
  if (parents) {
    const rootElement = parents.get(0);

    if (rootElement) {
      rootElement.recursiveChildren.forEach((element) => {
        if (element.id) {
          dataStructures[element.id.toValue()] = element;
        }
      });
    }
  }

  return dataStructures;
}

function serializeForm({ api }) {
  const dataStructures = collectElementByIDs(api);
  const values = api.valueOf(undefined, dataStructures);

  const boundary = 'BOUNDARY';

  let content = '';

  if (typeof values === 'string') {
    content += `--${boundary}\r\n`;
    content += 'Content-Disposition: form-data; name="undefined"\r\n\r\n';
    content += `${values}\r\n`;
  } else {
    _.forOwn(values, (value, key) => {
      content += `--${boundary}\r\n`;
      content += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      content += `${value}\r\n`;
    });
  }

  content += `--${boundary}--\r\n`;
  return content;
}

module.exports = serializeForm;
