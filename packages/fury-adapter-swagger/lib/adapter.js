const _ = require('lodash');
const Parser = require('./parser');

const name = 'swagger';

// TODO: Figure out media type for Swagger 2.0
const mediaTypes = [
  'application/swagger+json',
  'application/swagger+yaml',
];

const detect = source => !!(_.isString(source)
  ? source.match(/"?swagger"?\s*:\s*["']2\.0["']/g)
  : source.swagger === '2.0');

/*
 * Parse Swagger 2.0 into Refract elements
 */
function parse(options) {
  return new Promise((fulfil, reject) => {
    const parser = new Parser(options);
    parser.parse((error, parseResult) => {
      if (error) {
        reject(error);
      } else {
        fulfil(parseResult);
      }
    });
  });
}

/**
 * @implements {FuryAdapter}
 */
module.exports = {
  name, mediaTypes, detect, parse,
};
