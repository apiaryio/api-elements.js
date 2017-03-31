export function baseLink(element, parser, options = {}) {
  const { Link } = parser.minim.elements;

  const link = new Link();
  link.relation = options.relation || 'origin';
  link.href = `http://docs.apiary.io/validations/swagger#${(options.fragment || '')}`;

  element.links.push(link);
}

export function origin(fragment, element, parser) {
  baseLink(element, parser, {
    fragment,
  });
}

export function inferred(fragment, element, parser) {
  baseLink(element, parser, {
    relation: 'inferred',
    fragment,
  });
}

export default { origin, inferred };
