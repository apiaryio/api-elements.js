/* eslint-disable no-unused-expressions  */
// Allows chai `expect(true).to.be.true;`

import { expect } from 'chai';
import { isTextContentType } from '../src/media-type';

describe('isTextContentType', () => {
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
