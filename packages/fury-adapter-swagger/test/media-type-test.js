const { expect } = require('chai');
const {
  isTextContentType, isMultiPartFormData, hasBoundary, parseBoundary,
} = require('../lib/media-type');

describe('#isTextContentType', () => {
  it('does not detect non-text content type', () => {
    expect(isTextContentType('application/json')).to.be.false;
  });

  it('does not detect invalid content type', () => {
    expect(isTextContentType('')).to.be.false;
  });

  it('detects plain text', () => {
    expect(isTextContentType('text/plain')).to.be.true;
  });

  it('detects html text', () => {
    expect(isTextContentType('text/html')).to.be.true;
  });

  it('detects text content type with version', () => {
    expect(isTextContentType('text/plain; version=1')).to.be.true;
  });
});

describe('#isMultiPartFormData', () => {
  it('does not detect non multipart form content type', () => {
    expect(isMultiPartFormData('application/json')).to.be.false;
  });

  it('does not detect invalid content type', () => {
    expect(isMultiPartFormData('')).to.be.false;
  });

  it('detects multipart/form-data', () => {
    expect(isMultiPartFormData('multipart/form-data')).to.be.true;
  });

  it('detects text multipart/form-data with version', () => {
    expect(isMultiPartFormData('multipart/form-data; BOUNDARY=ABC')).to.be.true;
  });
});

describe('#hasBoundary', () => {
  it('returns false when the given content type does not have a boundary', () => {
    expect(hasBoundary('multipart/form-data')).to.be.false;
  });

  it('returns true when the given content type has a boundary', () => {
    expect(hasBoundary('multipart/form-data; BOUNDARY=ABC')).to.be.true;
  });
});

describe('#parseBoundary', () => {
  it('defaults to BOUNDARY when no boundary is provided', () => {
    expect(parseBoundary('multipart/form-data')).to.equal('BOUNDARY');
  });

  it('parses the boundary from a content type', () => {
    expect(parseBoundary('multipart/form-data; BOUNDARY=ABC')).to.equal('ABC');
  });
});
