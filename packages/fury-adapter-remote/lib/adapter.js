const deckardcain = require('deckardcain');
const axios = require('axios');

const name = 'remote';

const outputMediaType = 'application/vnd.refract.parse-result+json; version=1.0';
const defaultInputMediaType = 'text/vnd.apiblueprint';

const defaultOptions = {
  // the default value, but consumers should be able to override to use their own deployment
  url: 'https://api.apielements.org',

  parseEndpoint: '/parser',
  validateEndpoint: '/validate',
  serializeEndpoint: '/composer',

  mediaTypes: {
    // the collection of "parse", media types we want this
    // instance of the adapter to handle.
    // NOTE, this allows you to use the API for one media type but
    // another local adapter for another.
    parse: [
      'text/vnd.apiblueprint',
      'application/swagger+json',
      'application/swagger+yaml',
      'application/vnd.oai.openapi',
      'application/vnd.oai.openapi+json',
    ],

    validate: [
      'text/vnd.apiblueprint',
      'application/swagger+json',
      'application/swagger+yaml',
      'application/vnd.oai.openapi',
      'application/vnd.oai.openapi+json',
    ],

    // the collection of "serialize", media types we want this
    // instance of the adapter to handle.
    serialize: [
      'text/vnd.apiblueprint',
    ],
  },
};

const detectMediaType = (source, defaultMediaType) => {
  const mediaType = deckardcain.identify(source);
  return mediaType || defaultMediaType;
};

class FuryRemoteAdapter {
  constructor(options) {
    this.name = name;
    this.options = options || defaultOptions;
    this.mediaTypes = this.options.mediaTypes || [];
  }

  detect(source, method) {
    const mediaType = deckardcain.identify(source);
    if (Array.isArray(this.mediaTypes) && this.mediaTypes.includes(mediaType) && (method === undefined || this[method])) {
      return true;
    } if (typeof this.mediaTypes === 'object') {
      if (method !== undefined) {
        return (this.mediaTypes[method] && this.mediaTypes[method].includes(mediaType) && this[method]);
      }
      const mediaTypes = [];
      Object.keys(this.mediaTypes).forEach((key) => {
        mediaTypes.concat(this.mediaTypes[key]); // the value of the current key.
      });
      return mediaTypes.includes(mediaType);
    }
    return false;
  }

  parse({ source, minim, mediaType }) {
    const inputMediaType = mediaType || detectMediaType(source, defaultInputMediaType);

    return axios({
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
    }).then(response => minim.serialiser.deserialise(response.data));
  }

  validate({ source, minim, mediaType }) {
    const inputMediaType = mediaType || detectMediaType(source, defaultInputMediaType);

    return axios({
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
    }).then(response => minim.serialiser.deserialise(response.data));
  }

  serialize({ api, minim, mediaType }) {
    const content = minim.serialiser.serialise(api);
    const inputMediaType = (content.element && content.element === 'parseResult') ? 'application/vnd.refract+json' : 'application/vnd.refract.parse-result+json';

    return axios({
      method: 'post',
      url: this.options.serializeEndpoint,
      baseURL: this.options.url,
      data: content,
      headers: {
        'Content-Type': inputMediaType,
        Accept: mediaType,
      },
    }).then(response => response.data);
  }
}

module.exports = FuryRemoteAdapter;
