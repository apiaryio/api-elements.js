const deckardcain = require('deckardcain');
const Parser = require('./parser');

const name = 'apiary-blueprint';

const mediaTypes = [
  'text/vnd.legacyblueprint',
];

const detect = source => mediaTypes.indexOf(deckardcain.identify(source)) !== -1;

const parse = (options, done) => {
  const parser = new Parser(options);
  parser.parse(done);
};

module.exports = {
  name, mediaTypes, detect, parse,
};
