const serializeHrefVariables = require('./serializeHrefVariables');
const serializeTransition = require('./serializeTransition');

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

  if (resource.transitions) {
    resource.transitions.forEach((transition) => {
      if (transition.method) {
        pathItem[transition.method.toValue().toLowerCase()] = serializeTransition(transition);
      }
    });
  }

  return pathItem;
}

module.exports = serializeResource;
