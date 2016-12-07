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

  findAdapter(source, mediaType, method) {
    let adapter;

    if (mediaType) {
      adapter = findAdapter(this.adapters, mediaType, method);
    } else {
      for (let i = 0; i < this.adapters.length; i++) {
        const current = this.adapters[i];
        if (current.detect && current.detect(source) && current[method]) {
          adapter = this.adapters[i];
          break;
        }
      }
    }

    return adapter;
  }

  validate({source, mediaType, adapterOptions}, done) {
    const adapter = this.findAdapter(source, mediaType, 'validate');

    if (!adapter) {
      return this.parse({source, mediaType, adapterOptions}, (err, result) => {
        if (result && result.annotations.length > 0) {
          const {ParseResult} = minim.elements;
          const parseResult = new ParseResult(result.annotations);
          done(err, parseResult);
        } else {
          done(err, null);
        }
      });
    }

    let options = {minim, source};

    if (adapterOptions) {
      options = Object.assign(options, adapterOptions);
    }

    adapter.validate(options, (err, elements) => {
      if (!elements || elements instanceof minim.BaseElement) {
        done(err, elements);
      } else {
        done(err, this.load(elements));
      }
    });
  }

  /*
   * Parse an input document into Javascript objects. This method uses
   * the registered adapters to automatically detect the input format,
   * then uses the adapter to convert into refract elements and loads
   * these into objects.
   */
  parse({source, mediaType, generateSourceMap = false, adapterOptions}, done) {
    const adapter = this.findAdapter(source, mediaType, 'parse');

    if (!adapter) {
      return done(new Error('Document did not match any registered parsers!'));
    }

    try {
      let options = {generateSourceMap, minim, source};

      if (adapterOptions) {
        options = Object.assign(options, adapterOptions);
      }

      adapter.parse(options, (err, elements) => {
        if (!elements || elements instanceof minim.BaseElement) {
          done(err, elements);
        } else {
          done(err, this.load(elements));
        }
      });
    } catch (err) {
      return done(err);
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
