function collectElementByIDs(element) {
  const dataStructures = {};

  const { parents } = element;
  if (parents && !parents.isEmpty) {
    const rootElement = parents.get(parents.length - 1);

    if (rootElement) {
      rootElement.recursiveChildren.forEach((element) => {
        if (element._meta && element._meta.get('id')) {
          dataStructures[element.id.toValue()] = element;
        }
      });
    }
  }

  return dataStructures;
}

function serializeJSON(element) {
  if (element.element === 'dataStructure') {
    return serializeJSON(element.content);
  }
  const dataStructures = collectElementByIDs(element);
  const value = element.valueOf(undefined, dataStructures);
  return JSON.stringify(value);
}

module.exports = serializeJSON;
