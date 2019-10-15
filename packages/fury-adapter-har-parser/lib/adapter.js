const name = 'har';
const mediaTypes = [];

function detect(source) {
  let body;

  try {
    body = JSON.parse(source);
  } catch (error) {
    return false;
  }

  return body.log && body.log.version && body.log.version === '1.2';
}

function transformHeaders(namespace, headers) {
  if (headers && headers.length > 0) {
    // FIXME untested
    return new namespace.elements.HttpHeaders(headers.map((header) => {
      return new namespace.elements.Member(header.name, header.value);
    }));
  }

  return undefined;
}

function transformContent(namespace, content) {
  if (content && context.text) {

  }

  return undefined;
}

function transformRequest(namespace, request) {
  const element = new namespace.elements.HttpRequest();
  element.method = request.method;
  element.href = request.url;
  element.headers = transformHeaders(namespace, request.headers);
  // FIXME body
  return element;
}

function transformResponse(namespace, response) {
  const element = new namespace.elements.HttpResponse();
  element.statusCode = response.status;
  element.headers = transformHeaders(namespace, response.headers);
  // FIXME content
  return element;
}

function transformEntry(namespace, entry) {
  return new namespace.elements.HttpTransaction([
    transformRequest(namespace, entry.request),
    transformResponse(namespace, entry.response),
  ]);
}

async function parse({ source, namespace }) {
  const har = JSON.parse(source);

  const transactions = har.log.entries.map(entry => transformEntry(namespace, entry));
  return new namespace.elements.ParseResult(transactions);
}

module.exports = {
  name, mediaTypes, detect, parse,
};
