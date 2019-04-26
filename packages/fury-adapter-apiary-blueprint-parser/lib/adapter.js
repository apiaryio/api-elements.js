const deckardcain = require('deckardcain');
const Parser = require('./parser');

const name = 'apiary-blueprint';

const mediaTypes = [
  'text/vnd.legacyblueprint',
];

const detect = source => mediaTypes.indexOf(deckardcain.identify(source)) !== -1;

function parse(options) {
  const parser = new Parser(options);
  return Promise.resolve(parser.parse());
}

module.exports = {
  name, mediaTypes, detect, parse,
};
