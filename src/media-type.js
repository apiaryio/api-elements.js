import mediaTyper from 'media-typer';
import contentTypeModule from 'content-type';

export const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

function parse(contentType) {
  const { type } = contentTypeModule.parse(contentType);
  return mediaTyper.parse(type);
}

export function isValidContentType(contentType) {
  try {
    parse(contentType);
  } catch (e) {
    return false;
  }
  return true;
}

export function isJsonContentType(contentType) {
  try {
    const type = parse(contentType);
    return type.suffix === 'json' || type.subtype === 'json';
  } catch (e) {
    return false;
  }
}

export function isTextContentType(contentType) {
  try {
    return parse(contentType).type === 'text';
  } catch (e) {
    return false;
  }
}

export function isMultiPartFormData(contentType) {
  try {
    const type = parse(contentType);
    return type.type === 'multipart' && type.subtype === 'form-data';
  } catch (e) {
    return false;
  }
}

export function isFormURLEncoded(contentType) {
  try {
    const type = parse(contentType);
    return type.type === 'application' && type.subtype === 'x-www-form-urlencoded';
  } catch (e) {
    return false;
  }
}

export function hasBoundary(contentType) {
  try {
    const type = contentTypeModule.parse(contentType);
    return type.parameters.boundary !== undefined;
  } catch (e) {
    return false;
  }
}

export function parseBoundary(contentType) {
  const boundary = 'BOUNDARY';

  try {
    const type = contentTypeModule.parse(contentType);

    if (type.parameters.boundary) {
      return type.parameters.boundary;
    }
  } catch (e) {
    // Ignore invalid content type
  }

  return boundary;
}
