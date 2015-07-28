import minim from 'minim';
import * as apiBlueprintAdapter from './adapters/api-blueprint';
import * as swagger20Adapter from './adapters/swagger20';

// Legacy imports
import legacyAPI from './legacy/blueprint';
import legacyBlueprintParser from './legacy/blueprint-parser';
import legacyMarkdownRenderer from './legacy/markdown';

// Register API primitives
import './refract/api';

/*
 * Find an adapter by a given media type. If no adapter is found, then
 * undefined is returned.
 */
function findAdapter(adapters, mediaType) {
  for (let i = 0; i < adapters.length; i++) {
    if (adapters[i].mediaTypes.indexOf(mediaType) !== -1) {
      return adapters[i];
    }
  }
}

class Fury {
  constructor() {
    this.adapters = [
      swagger20Adapter,
      apiBlueprintAdapter
    ];
  }

  /*
   * Load serialized refract elements into Javascript objects.
   */
  load(elements) {
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
  parse({source, mediaType, generateSourceMap=false}, done) {
    let adapter;

    if (mediaType) {
      adapter = findAdapter(this.adapters, mediaType);
    } else {
      for (let i = 0; i < this.adapters.length; i++) {
        if (this.adapters[i].detect(source)) {
          adapter = this.adapters[i];
          break;
        }
      }
    }

    if (adapter) {
      adapter.parse({source, generateSourceMap}, (err, elements) => {
        if (err) { return done(err); }

        if (elements instanceof minim.BaseElement) {
          done(null, elements);
        } else {
          done(null, this.load(elements));
        }
      });
    } else {
      done(new Error('Document did not match any registered adapter!'));
    }
  }

  /*
   * Serialize a parsed API into the given output format.
   */
  serialize({api, mediaType='text/vnd.apiblueprint'}, done) {
    let adapter = findAdapter(this.adapters, mediaType);

    if (adapter) {
      adapter.serialize({api}, done);
    } else {
      done(new Error('Media type did not match any registered adapter!'));
    }
  }
}

/*
  Since we need to provide a sane interface to both ES6 `import` and
  normal Node.js `require` statements, we make a single default export
  and set up some other faux exports within it. See Babel's module
  docs: https://babeljs.io/docs/usage/modules/.
*/
const fury = new Fury();

fury.Fury = Fury;
fury.legacyAPI = legacyAPI;
fury.legacyBlueprintParser = legacyBlueprintParser;
fury.legacyMarkdownRenderer = legacyMarkdownRenderer;

export default fury;
