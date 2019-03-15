const deckardcain = require('deckardcain');
const axios = require('axios');

const name = 'remote';

const outputMediaType = 'application/vnd.refract.parse-result+json; version=1.0';

const defaultOptions = {
  // the default value, but consumers should be able to override to use their own deployment
  url: 'https://api.apielements.org',

  parseEndpoint: '/parser',
  validateEndpoint: '/validate',
  serializeEndpoint: '/composer',

  // the collection of "parse", media types we want this
  // instance of the adapter to handle.
  // NOTE, this allows you to use the API for one media type but
  // another local adapter for another.
  parseMediaTypes: [
    'text/vnd.apiblueprint',
    'application/swagger+json',
    'application/swagger+yaml',
    'application/vnd.oai.openapi',
    'application/vnd.oai.openapi+json',
  ],

  // the collection of "serialize", media types we want this
  // instance of the adapter to handle.
  serializeMediaTypes: [
    'application/vnd.refract+json',
    'application/vnd.refract.parse-result+json',
  ],

  // fallback to try send input, if not indentified by deckardcain
  defaultParseMediaType: 'text/vnd.apiblueprint',
  defaultSerializeMediaType: 'application/vnd.refract+json',
};

const detectMediaType = (source, defaultMediaType) => {
  const mediaType = deckardcain.identify(source);
  return mediaType || defaultMediaType;
};

class FuryRemoteAdapter {
  constructor(options) {
    this.name = name;
    this.options = options || defaultOptions;
    const parseMediaTypes = this.options.parseMediaTypes || [];
    const serializeMediaTypes = this.options.serializeMediaTypes || [];

    this.mediaTypes = parseMediaTypes.concat(serializeMediaTypes);
  }

  detect(source) {
    return this.mediaTypes.includes(deckardcain.identify(source));
  }

  parse({ source, minim }, cb) {
    const inputMediaType = detectMediaType(source, this.options.defaultInputMediaType);

    axios({
      method: 'post',
      url: this.options.parseEndpoint,
      baseURL: this.options.url,
      data: source,
      headers: {
        'Content-Type': inputMediaType,
        Accept: outputMediaType,
      },
      // allow code 422 to be identified as valid response
      validateStatus: status => ((status >= 200 && status < 300) || status === 422),
    })
      .then((response) => {
        cb(null, minim.serialiser.deserialise(response.data));
      }, (err) => {
        cb(err, undefined);
      });
  }

  validate({ source, minim }, cb) {
    const inputMediaType = detectMediaType(source, this.options.defaultInputMediaType);

    axios({
      method: 'post',
      url: this.options.validateEndpoint,
      baseURL: this.options.url,
      data: {
        input_document: source,
        input_type: inputMediaType,
        output_type: outputMediaType,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: outputMediaType,
      },
    })
      .then((response) => {
        cb(null, minim.serialiser.deserialise(response.data));
      }, (err) => {
        cb(err, undefined);
      });
  }

  serialize({ api, minim }, cb) {
    let inputMediaType = this.options.defaultSerializeMediaType;
    const content = minim.serialiser.serialise(api);

    if (content.element && content.element === 'parseResult') {
      inputMediaType = 'application/vnd.refract.parse-result+json';
    }

    axios({
      method: 'post',
      url: this.options.serializeEndpoint,
      baseURL: this.options.url,
      data: content,
      headers: {
        'Content-Type': inputMediaType,
        Accept: 'text/vnd.apiblueprint',
      },
    })
      .then((response) => {
        cb(null, response.data);
      }, (err) => {
        cb(err, undefined);
      });
  }
}

module.exports = {
  FuryRemoteAdapter,
};
