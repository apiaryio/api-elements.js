const R = require('ramda');
const serializeResource = require('./serializeResource');

const isResource = element => element.element === 'resource';
const isCategory = element => element.element === 'category';
const isResourceGroup = R.allPass([
  isCategory,
  category => category.classes.contains('resourceGroup'),
]);
const isResourceOrResourceGroup = R.anyPass([isResource, isResourceGroup]);

function convertUri(href) {
  return href.toValue().replace(/{[+#./;?&](.*)\*?}/, '');
}

function serializeResourceGroup(category) {
  let paths = {};

  category.forEach((element) => {
    if (isResource(element)) {
      paths[convertUri(element.href)] = serializeResource(element);
    } else if (isResourceOrResourceGroup(element)) {
      paths = R.mergeAll([paths, serializeResourceGroup(element)]);
    }
  });

  return paths;
}

function serializeApi(api) {
  const info = {};

  const title = api.meta.get('title');
  if (title) {
    info.title = title.toValue();
  } else {
    info.title = 'API';
  }

  const version = api.attributes.get('version');
  if (version) {
    info.version = version.toValue();
  } else {
    info.version = 'Unknown';
  }

  if (api.copy.length > 0) {
    info.description = api.copy.toValue().join('\n\n');
  }

  const document = {
    openapi: '3.0.3',
    info,
    paths: serializeResourceGroup(api),
  };

  return document;
}

module.exports = serializeApi;
