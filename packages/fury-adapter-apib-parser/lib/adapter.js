// API Blueprint parser for Fury.js

const deckardcain = require('deckardcain');
const drafter = require('drafter');

const name = 'api-blueprint';
const mediaTypes = [
  'text/vnd.apiblueprint',
  'text/vnd.apiblueprint+markdown',
];

const detect = source => mediaTypes.indexOf(deckardcain.identify(source)) !== -1;

const validate = ({ source, requireBlueprintName }, done) => {
  const options = {
    requireBlueprintName,
  };

  drafter.validate(source, options, done);
};

/*
 * Parse an API Blueprint into refract elements.
 */
const parse = ({
  source, generateSourceMap, requireBlueprintName,
}, done) => {
  const options = {
    exportSourcemap: !!generateSourceMap,
    requireBlueprintName,
  };

  drafter.parse(source, options, done);
};

module.exports = {
  name, mediaTypes, detect, validate, parse,
};
