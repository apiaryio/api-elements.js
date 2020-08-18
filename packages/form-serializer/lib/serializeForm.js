const _ = require('lodash');
const querystring = require('querystring');

function collectElementByIDs(element) {
  const dataStructures = {};

  if (typeof element.content === 'string') {
    dataStructures.undefined = element.content;
    return dataStructures;
  }

  const { parents } = element;
  if (!parents || parents.isEmpty) {
    return dataStructures;
  }

  const rootElement = parents.get(parents.length - 1);

  if (rootElement) {
    rootElement.recursiveChildren.forEach((element) => {
      if (element.id) {
        dataStructures[element.id.toValue()] = element;
      }
    });
  }

  return dataStructures;
}

function serializeForm({ api, mediaType }) {
  const dataStructures = collectElementByIDs(api);
  let values = api.valueOf(undefined, dataStructures);

  if (mediaType === 'multipart/form-data') {
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
  if (typeof values === 'string') {
    values = { undefined: values };
  }
  return querystring.encode(values);
}

module.exports = serializeForm;
