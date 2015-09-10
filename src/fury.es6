import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';

import * as apiBlueprintAdapter from './adapters/api-blueprint';
import * as swagger20Adapter from './adapters/swagger20';

// Legacy imports
import legacyAPI from './legacy/blueprint';
import legacyBlueprintParser from './legacy/blueprint-parser';
import legacyMarkdownRenderer from './legacy/markdown';

const minim = minimModule.namespace()
  .use(minimParseResult);

/*
 * Find an adapter by a given media type and method name, which should be
 * either `parse` or `serialize`. If no adapter is found, then
 * undefined is returned.
 */
function findAdapter(adapters, mediaType, method) {
  for (let i = 0; i < adapters.length; i++) {
    if (adapters[i].mediaTypes.indexOf(mediaType) !== -1 && adapters[i][method]) {
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
   * Register to use an adapter with this Fury instance.
   */
  use(adapter) {
    this.adapters.push(adapter);
  }

  /*
   * Load serialized refract elements into Javascript objects.
   */
  load(elements) {
    let api;

    // Support both shorthand syntax and the long-form refract, attempting
    // to autodetect which we are getting.
    if (Array.isArray(elements)) {
      api = minim.fromCompactRefract(elements);
    } else {
      api = minim.fromRefract(elements);
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
      adapter = findAdapter(this.adapters, mediaType, 'parse');
    } else {
      for (let i = 0; i < this.adapters.length; i++) {
        if (this.adapters[i].detect(source) && this.adapters[i].parse) {
          adapter = this.adapters[i];
          break;
        }
      }
    }

    if (adapter) {
      adapter.parse({generateSourceMap, minim, source}, (err, elements) => {
        if (err) { return done(err); }

        if (elements instanceof minim.BaseElement) {
          done(null, elements);
        } else {
          done(null, this.load(elements));
        }
      });
    } else {
      done(new Error('Document did not match any registered parser!'));
    }
  }

  /*
   * Serialize a parsed API into the given output format.
   */
  serialize({api, mediaType='text/vnd.apiblueprint'}, done) {
    let adapter = findAdapter(this.adapters, mediaType, 'serialize');

    if (adapter) {
      adapter.serialize({api, minim}, done);
    } else {
      done(new Error('Media type did not match any registered serializer!'));
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
