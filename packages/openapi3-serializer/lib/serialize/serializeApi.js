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
    paths: {},
  };

  return document;
}

module.exports = serializeApi;
