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

const isPrimitive = value => value !== undefined && (value !== Object(value));

function serializeText(element, done) {
  if (element.element === 'dataStructure') {
    return serializeText(element.content, done);
  }

  const dataStructures = collectElementByIDs(element);
  const value = element.valueOf(undefined, dataStructures);

  if (isPrimitive(value)) {
    return done(null, String(value));
  }

  return done(new Error('Only primitive elements can be serialized as text/plain'));
}

module.exports = serializeText;
