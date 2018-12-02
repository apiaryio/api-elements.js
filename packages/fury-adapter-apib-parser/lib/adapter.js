// API Blueprint parser for Fury.js

const deckardcain = require('deckardcain');
const drafter = require('drafter');
const { JSON06Serialiser } = require('minim');

const name = 'api-blueprint';
const mediaTypes = [
  'text/vnd.apiblueprint',
  'text/vnd.apiblueprint+markdown',
];

const detect = source => mediaTypes.indexOf(deckardcain.identify(source)) !== -1;

const validate = ({ minim, source, requireBlueprintName }, done) => {
  const options = {
    requireBlueprintName,
  };

  const serialiser = new JSON06Serialiser(minim);

  drafter.validate(source, options, (err, parseResult) => {
    if (parseResult) {
      done(err, serialiser.deserialise(parseResult));
    } else {
      done(err, parseResult);
    }
  });
};

/*
 * Parse an API Blueprint into refract elements.
 */
const parse = ({
  minim, source, generateSourceMap, requireBlueprintName,
}, done) => {
  const options = {
    exportSourcemap: !!generateSourceMap,
    requireBlueprintName,
  };

  const serialiser = new JSON06Serialiser(minim);

  drafter.parse(source, options, (err, parseResult) => {
    if (parseResult) {
      done(err, serialiser.deserialise(parseResult));
    } else {
      done(err, parseResult);
    }
  });
};

module.exports = {
  name, mediaTypes, detect, validate, parse,
};
