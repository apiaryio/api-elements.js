function serializeHrefVariables(href, hrefVariables) {
  return hrefVariables.map((value, key) => {
    const parameter = {
      name: key.toValue(),
    };

    if (href.toValue().includes(`{${key.toValue()}}`)) {
      parameter.in = 'path';
    } else {
      // FIXME assuming parameter is query
      parameter.in = 'query';
    }

    return parameter;
  });
}

module.exports = serializeHrefVariables;
