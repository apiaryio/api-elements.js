// API Blueprint parser for Fury.js

import deckardcain from 'deckardcain';
import drafter from 'drafter';

export const name = 'api-blueprint';
export const mediaTypes = [
  'text/vnd.apiblueprint',
];

export function detect(source) {
  return mediaTypes.indexOf(deckardcain.identify(source)) !== -1;
}

/*
 * Parse an API Blueprint into refract elements.
 */
export function parse({source, generateSourceMap}, done) {
  const options = {
    exportSourcemap: !!generateSourceMap,
    type: 'refract',
  };

  drafter.parse(source, options, done);
}

export default {name, mediaTypes, detect, parse};
