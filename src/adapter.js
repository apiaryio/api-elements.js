import deckardcain from 'deckardcain';
import Parser from './parser';

export const name = 'apiary-blueprint';

export const mediaTypes = [
  'text/vnd.legacyblueprint',
];

export function detect(source) {
  return mediaTypes.indexOf(deckardcain.identify(source)) !== -1;
}

export function parse(options, done) {
  const parser = new Parser(options);
  parser.parse(done);
}

export default {name, mediaTypes, detect, parse};
