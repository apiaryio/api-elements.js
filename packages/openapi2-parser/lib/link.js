const baseLink = (element, parser, relation, options = {}) => {
  const { String: StringElement, Link } = parser.namespace.elements;

  const opts = {
    path: options.path || [],
    url: options.url || `http://docs.apiary.io/validations/swagger#${(options.fragment || '')}`,
  };

  const href = new StringElement(opts.url);
  const link = new Link();

  if (parser.generateSourceMap) {
    parser.createSourceMap(href, opts.path.concat(['url']));
  }

  link.relation = relation;
  link.href = href;

  if (options.description) {
    link.description = options.description;

    if (parser.generateSourceMap) {
      parser.createSourceMap(link.meta.get('description'), opts.path.concat(['description']));
    }
  }

  element.links.push(link);
};

const origin = (fragment, element, parser) => {
  baseLink(element, parser, 'origin', {
    fragment,
  });
};

const inferred = (fragment, element, parser) => {
  baseLink(element, parser, 'inferred', {
    fragment,
  });
};

module.exports = { baseLink, origin, inferred };
