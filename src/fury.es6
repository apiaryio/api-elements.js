import * as refract from './refract/primitives';

// Register API primitives
import './refract/api';

export function load(elements) {
  let api;

  // Support both shorthand syntax and the long-form refract, attempting
  // to autodetect which we are getting.
  if (Array.isArray(elements)) {
    api = refract.convertFromCompactRefract(elements);
  } else {
    api = refract.convertFromRefract(elements);
  }

  return api;
}

export function parse({source, sourceMap=false}, done) {
  done(new Error('Not implemented yet!'));
}

export {default as legacyAPI} from './legacy/blueprint';
export {default as legacyBlueprintParser} from './legacy/blueprint-parser';
export {default as legacyMarkdownRenderer} from './legacy/markdown';
