const mediaTyper = require('media-typer');
const contentTypeModule = require('content-type');

const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

function parse(contentType) {
  const { type } = contentTypeModule.parse(contentType);
  return mediaTyper.parse(type);
}

const isValidContentType = (contentType) => {
  try {
    parse(contentType);
  } catch (e) {
    return false;
  }
  return true;
};

const isJsonContentType = (contentType) => {
  try {
    const type = parse(contentType);
    return type.suffix === 'json' || type.subtype === 'json';
  } catch (e) {
    return false;
  }
};

const isTextContentType = (contentType) => {
  try {
    return parse(contentType).type === 'text';
  } catch (e) {
    return false;
  }
};

const isMultiPartFormData = (contentType) => {
  try {
    const type = parse(contentType);
    return type.type === 'multipart' && type.subtype === 'form-data';
  } catch (e) {
    return false;
  }
};

const isFormURLEncoded = (contentType) => {
  try {
    const type = parse(contentType);
    return type.type === 'application' && type.subtype === 'x-www-form-urlencoded';
  } catch (e) {
    return false;
  }
};

const hasBoundary = (contentType) => {
  try {
    const type = contentTypeModule.parse(contentType);
    return type.parameters.boundary !== undefined;
  } catch (e) {
    return false;
  }
};

const parseBoundary = (contentType) => {
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
};

module.exports = {
  FORM_CONTENT_TYPE, isValidContentType, isJsonContentType, isTextContentType, isMultiPartFormData, isFormURLEncoded, hasBoundary, parseBoundary,
};
