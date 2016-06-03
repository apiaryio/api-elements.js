import link from './link';

export function createHeaders(payload, parser) {
  const {HttpHeaders} = parser.minim.elements;

  const headers = new HttpHeaders();

  payload.headers = payload.headers || headers;
}

export function pushHeader(key, value, payload, parser, fragment) {
  const {Member: MemberElement} = parser.minim.elements;

  const header = new MemberElement(key, value);

  if (fragment) {
    link.inferred(fragment, header, parser);
  }

  payload.headers.push(header);
}

export default {createHeaders, pushHeader};
