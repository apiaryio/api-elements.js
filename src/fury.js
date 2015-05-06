var fury = {};
var refract = require('./refract/primitives');

// Register API primitives
require('./refract/api');

function load(elements) {
  var api;

  // Support both shorthand syntax and the long-form refract, attempting
  // to autodetect which we are getting.
  if (Array.isArray(elements)) {
    api = refract.convertFromCompactRefract(elements);
  } else {
    api = refract.convertFromRefract(elements);
  }

  return api;
}

fury.load = load;

// Legacy Interface
fury.legacyAPI = require('./legacy/blueprint');
fury.legacyBlueprintParser = require('./legacy/blueprint-parser');
fury.legacyMarkdownRenderer = require('./legacy/markdown');

module.exports = fury;
