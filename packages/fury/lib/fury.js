const { Namespace } = require('api-elements');

const minim = new Namespace();

/*
 * Find an adapter by a given media type and method name, which should be
 * either `parse` or `serialize`. If no adapter is found, then
 * undefined is returned.
 */
const findAdapter = (adapters, mediaType, method) => {
  for (let i = 0; i < adapters.length; i += 1) {
    const adapter = adapters[i];
    if (Array.isArray(adapter.mediaTypes) && adapter.mediaTypes.includes(mediaType) && adapter[method]) {
      return adapter;
    } if (typeof adapter.mediaTypes === 'object' && adapter.mediaTypes[method] && adapter.mediaTypes[method].includes(mediaType) && adapter[method]) {
      return adapter;
    }
  }

  return null;
};

/**
 * @interface FuryAdapter
 *
 * @property name {string}
 * @property mediaTypes {string[]}
 */

/**
 * @function detect
 *
 * @param source {string}
 * @returns {boolean}
 *
 * @memberof FuryAdapter
 */

/**
 * @function validate
 *
 * @param {Object} options
 * @param {string} options.source
 * @param {Namespace} options.minim
 * @param {ParseCallback} callback
 *
 * @memberof FuryAdapter
 */

/**
 * @function parse
 *
 * @param {Object} options
 * @param {string} options.source
 * @param {Namespace} options.minim
 * @param {ParseCallback} callback
 *
 * @memberof FuryAdapter
 */

/**
 * @function serialize
 *
 * @param {Object} options
 * @param {Category} options.api
 * @param {Namespace} options.minim
 * @param {SerializeCallback} callback
 *
 * @memberof FuryAdapter
 */

/**
 */
class Fury {
  constructor() {
    this.minim = minim;
    this.adapters = [];
  }

  /**
   * Register to use an adapter with this Fury instance.
   *
   * @param {FuryAdapter}
   */
  use(adapter) {
    this.adapters.push(adapter);
    return this;
  }

  /*
   * Load serialized refract elements into Javascript objects.
   */
  load(elements) {
    return this.minim.fromRefract(elements);
  }

  /**
   * Returns an array of adapters which can handle the given API Description Source
   * it is internally invoked while `mediaType` is not sent
   * into methods `parse()`, `validate()` or `serialized()`
   *
   * @param source {string}
   * @param method {string} - optional
   *
   * @return {FuryAdapter}
   */
  detect(source, method) {
    const adapters = this.adapters.filter(adapter => (adapter.detect && adapter.detect(source, method)) && (method === undefined || adapter[method]));
    return adapters;
  }

  findAdapter(source, mediaType, method) {
    if (mediaType) {
      return findAdapter(this.adapters, mediaType, method);
    }

    return this.detect(source, method).filter(adapter => adapter[method])[0];
  }

  /**
   * @callback ParseCallback
   *
   * @param {Error} error
   * @param {ParseResult} parseResult
   */

  /**
   * Validate an API Description Document
   *
   * @param {Object} options
   * @param {string} options.source
   * @param {string} [options.mediaType]
   * @param {Object} [options.adapterOptions]
   * @param callback {ParseCallback}
   */
  validate({ source, mediaType, adapterOptions }, done) {
    const adapter = this.findAdapter(source, mediaType, 'validate');

    if (!adapter) {
      return this.parse({ source, mediaType, adapterOptions }, (err, parseResult) => {
        if (err) {
          return done(err);
        }

        if (parseResult.annotations.length > 0) {
          const { ParseResult } = this.minim.elements;
          return done(null, new ParseResult(parseResult.annotations));
        }

        return done(null, null);
      });
    }

    let options = { minim: this.minim, mediaType, source };

    if (adapterOptions) {
      options = Object.assign(options, adapterOptions);
    }

    return adapter.validate(options, (err, parseResult) => {
      if (err) {
        return done(err);
      }

      if (parseResult && !(parseResult instanceof this.minim.Element)) {
        return done(null, this.load(parseResult));
      }

      return done(null, parseResult);
    });
  }

  /**
   * Parse an API Description Document
   *
   * This method uses the registered adapters to automatically detect the
   * input format, then uses the adapter to convert into refract elements
   * and loads these into objects.
   *
   * @param {Object} options
   * @param {string} options.source
   * @param {string} [options.mediaType]
   * @param {Object} [options.adapterOptions]
   * @param callback {ParseCallback}
   */
  parse({
    source, mediaType, generateSourceMap = false, adapterOptions,
  }, done) {
    const adapter = this.findAdapter(source, mediaType, 'parse');

    if (!adapter) {
      return done(new Error('Document did not match any registered parsers!'));
    }

    let options = {
      generateSourceMap, minim: this.minim, mediaType, source,
    };

    if (adapterOptions) {
      options = Object.assign(options, adapterOptions);
    }

    return adapter.parse(options, (err, parseResult) => {
      if (err) {
        return done(err);
      }

      if (!(parseResult instanceof this.minim.Element)) {
        return done(null, this.load(parseResult));
      }

      return done(null, parseResult);
    });
  }

  /**
   * @callback SerializeCallback
   *
   * @param {Error} error
   * @param {string} source
   */

  /**
   * Serialize an API Description into the given output format.
   *
   * @param {Object} options
   * @param {Category} options.api
   * @param {string} [options.mediaType]
   * @param callback {SerializeCallback}
   */
  serialize({ api, mediaType = 'text/vnd.apiblueprint' }, done) {
    const adapter = findAdapter(this.adapters, mediaType, 'serialize');

    if (adapter) {
      return adapter.serialize({ api, minim: this.minim, mediaType }, done);
    }

    return done(new Error('Media type did not match any registered serializer!'));
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

module.exports = fury;
