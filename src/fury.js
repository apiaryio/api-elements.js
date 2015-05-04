var fury = {};

// Legacy Interface
fury.Api = require('./refract/api');
fury.legacyAPI = require('./legacy/blueprint');
fury.legacyBlueprintParser = require('./legacy/blueprint-parser');
fury.legacyMarkdownRenderer = require('./legacy/markdown');

module.exports = fury;
