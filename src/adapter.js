// API Blueprint parser for Fury.js

import deckardcain from 'deckardcain';
import drafter from 'drafter';

export const name = 'api-blueprint';
export const mediaTypes = [
  'text/vnd.apiblueprint',
  'text/vnd.apiblueprint+markdown',
];

export function detect(source) {
  return mediaTypes.indexOf(deckardcain.identify(source)) !== -1;
}

export function validate({source, requireBlueprintName}, done) {
  const options = {
    requireBlueprintName,
  };

  drafter.validate(source, options, done);
}

/*
 * Parse an API Blueprint into refract elements.
 */
export function parse({source, generateSourceMap, requireBlueprintName}, done) {
  const options = {
    exportSourcemap: !!generateSourceMap,
    requireBlueprintName,
  };

  drafter.parse(source, options, done);
}

export default {name, mediaTypes, detect, validate, parse};
