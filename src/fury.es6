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
 * Parse an input document into Javascript objects. This method uses
 * the registered adapters to automatically detect the input format,
 * then uses the adapter to convert into refract elements and loads
 * these into objects.
 */
export function parse({source, sourceMap=false}, done) {
  let adapter;

  for (let i = 0; i < adapters.length; i++) {
    if (adapters[i].detect(source)) {
      adapter = adapters[i];
      break;
    }
  }

  if (adapter) {
    adapter.parse({source, sourceMap}, function (err, elements) {
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
export function serialize({api, adapterName='api-blueprint'}, done) {
  let adapter;

  for (let i = 0; i < adapters.length; i++) {
    if (adapters[i].name === adapterName) {
      adapter = adapters[i];
      break;
    }
  }

  if (adapter) {
    adapter.serialize({api}, done);
  } else {
    done(new Error('Name did not match any registered adapter!'));
  }
}

/*
 * Serialize a parsed API into the given output format.
 */
export function serialize({api, adapterName='api-blueprint'}, done) {
  done(new Error('Not implemented!'));
}

/* eslint block-scoped-var:1 */
export {default as legacyAPI} from './legacy/blueprint';
export {default as legacyBlueprintParser} from './legacy/blueprint-parser';
export {default as legacyMarkdownRenderer} from './legacy/markdown';
