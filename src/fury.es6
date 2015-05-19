import minim from 'minim';
import * as apiBlueprintAdapter from './adapters/api-blueprint';

// Register API primitives
import './refract/api';

// Registry of format adapters
export const adapters = [
  apiBlueprintAdapter
];

/*
 * Load serialized refract elements into Javascript objects.
 */
export function load(elements) {
  let api;

  // Support both shorthand syntax and the long-form refract, attempting
  // to autodetect which we are getting.
  if (Array.isArray(elements)) {
    api = minim.convertFromCompactRefract(elements);
  } else {
    api = minim.convertFromRefract(elements);
  }

  return api;
}

/*
 * Find an adapter by a given media type. If no adapter is found, then
 * undefined is returned.
 */
function findAdapter(mediaType) {
  for (let i = 0; i < adapters.length; i++) {
    if (adapters[i].mediaTypes.indexOf(mediaType) !== -1) {
      return adapters[i];
    }
  }
}

/*
 * Parse an input document into Javascript objects. This method uses
 * the registered adapters to automatically detect the input format,
 * then uses the adapter to convert into refract elements and loads
 * these into objects.
 */
export function parse({source, mediaType, generateSourceMap=false}, done) {
  let adapter;

  if (mediaType) {
    adapter = findAdapter(mediaType);
  } else {
    for (let i = 0; i < adapters.length; i++) {
      if (adapters[i].detect(source)) {
        adapter = adapters[i];
        break;
      }
    }
  }

  if (adapter) {
    adapter.parse({source, generateSourceMap}, (err, elements) => {
      if (err) { return done(err); }

      done(null, load(elements));
    });
  } else {
    done(new Error('Document did not match any registered adapter!'));
  }
}

/*
 * Serialize a parsed API into the given output format.
 */
export function serialize({api, mediaType='text/vnd.apiblueprint'}, done) {
  let adapter = findAdapter(mediaType);

  if (adapter) {
    adapter.serialize({api}, done);
  } else {
    done(new Error('Media type did not match any registered adapter!'));
  }
}

/* eslint block-scoped-var:1 */
export {default as legacyAPI} from './legacy/blueprint';
export {default as legacyBlueprintParser} from './legacy/blueprint-parser';
export {default as legacyMarkdownRenderer} from './legacy/markdown';
