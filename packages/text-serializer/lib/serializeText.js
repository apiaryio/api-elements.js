function collectElementByIDs(element) {
  const dataStructures = {};
  const { parents } = element;

  if (!parents || parents.isEmpty) {
    return dataStructures;
  }

  const rootElement = parents.get(parents.length - 1);

  if (rootElement) {
    rootElement.recursiveChildren.forEach((element) => {
      // eslint-disable-next-line no-underscore-dangle
      const isNotEmptyStringElement = element._meta && element._meta.get('id');

      if (isNotEmptyStringElement) {
        dataStructures[element.id.toValue()] = element;
      }
    });
  }

  return dataStructures;
}

const isPrimitive = element => element && element.element.match(/^(string|number|boolean|null)$/);

function serializeText(element) {
  if (element.element === 'dataStructure') {
    return serializeText(element.content);
  }

  const dataStructures = collectElementByIDs(element);
  if (isPrimitive(element) || isPrimitive(dataStructures[element.element])) {
    const value = element.valueOf(undefined, dataStructures);

    return String(value);
  }

  throw new Error('Only primitive elements can be serialized as text/plain');
}

module.exports = serializeText;
