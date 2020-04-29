const { inferred } = require('./link');
const annotations = require('./annotations');

const createHeaders = (payload, parser) => {
  const { HttpHeaders } = parser.namespace.elements;

  const headers = new HttpHeaders();

  // eslint-disable-next-line no-param-reassign
  payload.headers = payload.headers || headers;
};

const pushHeader = (key, value, payload, parser, fragment) => {
  const { Member: MemberElement } = parser.namespace.elements;
  let header;

  createHeaders(payload, parser);

  const duplicate = payload.headers.find(member => member.key.content.toLowerCase() === key.toLowerCase());

  if (duplicate.length) {
    header = duplicate.first;
    header.value = value;
  } else {
    header = new MemberElement(key, value);
  }

  if (fragment) {
    inferred(fragment, header, parser);
  } else {
    // eslint-disable-next-line no-underscore-dangle
    header._meta = parser.namespace.toElement({});
  }

  if (fragment === undefined && parser.generateSourceMap) {
    parser.createSourceMap(header, parser.path);
  }

  if (!duplicate.length) {
    payload.headers.push(header);
  }

  return header;
};

const pushHeaderObject = (key, header, payload, parser) => {
  let value = '';

  if (header.type === 'array') {
    // TODO: Support collectionFormat once arrays are supported
    parser.createAnnotation(
      annotations.DATA_LOST, parser.path,
      'Headers of type array are not yet supported'
    );

    return;
  }

  const schema = { type: header.type };

  // Choose the first available option
  if (header.enum) {
    // TODO: This may lose data if there are multiple enums.
    [value] = header.enum;
  }

  if (header['x-example']) {
    parser.withPath('x-example', () => {
      value = parser.convertValueToElement(header['x-example'], schema);
    });
  } else if (header.default) {
    parser.withPath('default', () => {
      value = parser.convertValueToElement(header.default, schema);
    });
  }

  const headerElement = pushHeader(key, value, payload, parser);

  if (header.description) {
    headerElement.description = header.description;

    if (parser.generateSourceMap) {
      parser.createSourceMap(headerElement.meta.get('description'), parser.path.concat(['description']));
    }
  }
};

module.exports = { pushHeader, pushHeaderObject };
