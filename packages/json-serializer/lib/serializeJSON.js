function collectElementByIDs(element) {
  const dataStructures = {};
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

function serializeJSON(element) {
  const dataStructures = collectElementByIDs(element);
  const value = element.valueOf(undefined, dataStructures);
  return JSON.stringify(value);
}

module.exports = serializeJSON;
