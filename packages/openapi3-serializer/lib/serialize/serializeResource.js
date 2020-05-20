const serializeHrefVariables = require('./serializeHrefVariables');

function serializeResource(resource) {
  const pathItem = {};

  const title = resource.meta.get('title');
  if (title) {
    pathItem.summary = title.toValue();
  }

  if (resource.copy.length > 0) {
    pathItem.description = resource.copy.toValue().join('\n\n');
  }

  if (resource.hrefVariables) {
    pathItem.parameters = serializeHrefVariables(resource.href, resource.hrefVariables);
  }

  return pathItem;
}

module.exports = serializeResource;
