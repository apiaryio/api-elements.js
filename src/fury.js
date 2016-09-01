import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';

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
    this.adapters = [];
  }

  /*
   * Register to use an adapter with this Fury instance.
   */
  use(adapter) {
    this.adapters.push(adapter);
    return this;
  }

  /*
   * Load serialized refract elements into Javascript objects.
   */
  load(elements) {
    return minim.fromRefract(elements);
  }

  /*
   * Parse an input document into Javascript objects. This method uses
   * the registered adapters to automatically detect the input format,
   * then uses the adapter to convert into refract elements and loads
   * these into objects.
   */
  parse({source, mediaType, generateSourceMap = false, adapterOptions}, done) {
    let adapter;

    if (mediaType) {
      adapter = findAdapter(this.adapters, mediaType, 'parse');
    } else {
      for (let i = 0; i < this.adapters.length; i++) {
        const current = this.adapters[i];
        if (current.detect && current.detect(source) && current.parse) {
          adapter = this.adapters[i];
          break;
        }
      }
    }

    if (adapter) {
      try {
        let options = {generateSourceMap, minim, source};

        if (adapterOptions) {
          options = Object.assign(options, adapterOptions);
        }

        adapter.parse(options, (err, elements) => {
          if (!elements) {
            done(err);
          } else if (elements instanceof minim.BaseElement) {
            done(err, elements);
          } else {
            done(err, this.load(elements));
          }
        });
      } catch (err) {
        return done(err);
      }
    } else {
      done(new Error('Document did not match any registered parser!'));
    }
  }

  /*
   * Serialize a parsed API into the given output format.
   */
  serialize({api, mediaType = 'text/vnd.apiblueprint'}, done) {
    const adapter = findAdapter(this.adapters, mediaType, 'serialize');

    if (adapter) {
      try {
        adapter.serialize({api, minim}, done);
      } catch (err) {
        return done(err);
      }
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

export default fury;
