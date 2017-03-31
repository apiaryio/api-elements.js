import _ from 'lodash';
import Parser from './parser';

export const name = 'swagger';

// TODO: Figure out media type for Swagger 2.0
export const mediaTypes = [
  'application/swagger+json',
  'application/swagger+yaml',
];

export function detect(source) {
  return !!(_.isString(source)
    ? source.match(/"?swagger"?:\s*["']2\.0["']/g)
    : source.swagger === '2.0');
}

/*
 * Parse Swagger 2.0 into Refract elements
 */
export function parse(options, done) {
  const parser = new Parser(options);
  parser.parse(done);
}

export default { name, mediaTypes, detect, parse };
