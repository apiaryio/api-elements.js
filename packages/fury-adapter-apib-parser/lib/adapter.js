// API Blueprint parser for Fury.js

const deckardcain = require('deckardcain');

let drafter;

try {
  // eslint-disable-next-line import/no-unresolved, global-require
  drafter = require('protagonist');
} catch (error) {
  // eslint-disable-next-line global-require
  drafter = require('drafter.js');
}

const name = 'api-blueprint';
const mediaTypes = [
  'text/vnd.apiblueprint',
  'text/vnd.apiblueprint+markdown',
];

const detect = source => mediaTypes.indexOf(deckardcain.identify(source)) !== -1;

function validate({ source, requireBlueprintName }) {
  const options = {
    requireBlueprintName,
  };

  return drafter.validate(source, options);
}

/*
 * Parse an API Blueprint into refract elements.
 */
function parse({ source, generateSourceMap, requireBlueprintName }) {
  const options = {
    exportSourcemap: !!generateSourceMap,
    requireBlueprintName,
  };

  return drafter.parse(source, options);
}

module.exports = {
  name, mediaTypes, detect, validate, parse,
};
