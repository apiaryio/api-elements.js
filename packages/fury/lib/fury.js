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
 * Adapter Options
 * @typedef {Object} AdapterOptions
 * @property {boolean} generateSourceMap
 * @property {boolean} generateMessageBody
 * @property {boolean} generateMessageBodySchema
 */

/**
 * @function validate
 *
 * @param {Object} options
 * @param {string} options.source
 * @param {Namespace} options.namespace
 *
 * @returns {Promise}
 *
 * @memberof FuryAdapter
 */

/**
 * @function parse
 *
 * @param {Object} options
 * @param {string} options.source
 * @param {Namespace} options.namespace
 *
 * @returns {Promise}
 *
 * @memberof FuryAdapter
 */

/**
 * @function serialize
 *
 * @param {Object} options
 * @param {Category} options.api
 * @param {Namespace} options.namespace
 *
 * @returns {Promise}
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
   * @param {AdapterOptions} [options.adapterOptions]
   * @param callback {ParseCallback}
   */
  validate({ source, mediaType, adapterOptions }, done) {
    const adapter = this.findAdapter(source, mediaType, 'validate');

    if (!adapter) {
      const promise = this.parse({ source, mediaType, adapterOptions })
        .then((parseResult) => {
          if (parseResult.annotations.length > 0) {
            const { ParseResult } = this.minim.elements;
            return new ParseResult(parseResult.annotations);
          }

          return null;
        });

      if (done) {
        promise.then(result => done(null, result), done);
        return null;
      }

      return promise;
    }

    let options = { namespace: this.minim, mediaType, source };

    if (adapterOptions) {
      options = Object.assign(options, adapterOptions);
    }

    const promise = adapter
      .validate(options)
      .then((parseResult) => {
        if (parseResult && !(parseResult instanceof this.minim.Element)) {
          return this.load(parseResult);
        }

        return parseResult;
      });

    if (done) {
      promise.then(result => done(null, result), done);
      return null;
    }

    return promise;
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
   * @param {AdapterOptions} [options.adapterOptions]
   * @param callback {ParseCallback}
   */
  parse({
    source, mediaType, generateSourceMap = false, adapterOptions,
  }, done) {
    const adapter = this.findAdapter(source, mediaType, 'parse');

    if (!adapter) {
      const error = new Error('Document did not match any registered parsers!');

      if (done) {
        done(error);
        return null;
      }

      return Promise.reject(error);
    }

    let options = {
      generateSourceMap, namespace: this.minim, mediaType, source,
    };

    if (adapterOptions) {
      options = Object.assign(options, adapterOptions);
    }

    const promise = adapter.parse(options)
      .then((parseResult) => {
        if (parseResult instanceof this.minim.Element) {
          return parseResult;
        }

        return this.load(parseResult);
      });

    if (done) {
      promise.then(result => done(null, result), done);
      return null;
    }

    return promise;
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

    if (!adapter) {
      const error = new Error('Media type did not match any registered serializer!');

      if (done) {
        done(error);
        return null;
      }

      return Promise.reject(error);
    }

    if (!api) {
      // eslint-disable-next-line no-param-reassign
      api = new this.minim.elements.Category();
    }

    const promise = adapter.serialize({ api, namespace: this.minim, mediaType });

    if (done) {
      promise.then(result => done(null, result), done);
      return null;
    }

    return promise;
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
