import Drafter from 'drafter';

// Auto-detect via the API Blueprint format metadata.
const FORMAT1A = /^[\uFEFF]?(((VERSION:( |\t)2)|(FORMAT:( |\t)(X-)?1A))\n)/i;

export const name = 'api-blueprint';
export const mediaTypes = [
  'text/vnd.apiblueprint'
];

/*
 * Automatically detect the API Blueprint format if the media type of the
 * input source is not available.
 */
export function detect(source) {
  return source.match(FORMAT1A) !== null;
}

/*
 * Parse an API Blueprint into refract elements.
 */
export function parse({source, generateSourceMap}, done) {
  const drafter = new Drafter({
    exportSourcemap: generateSourceMap
  });

  drafter.make(source, (err, result) => {
    // TODO: Figure out what exactly drafter is returning and how
    //       to request refract output.
    done(err, result);
  });
}

/*
 * Serialize an API into API Blueprint.
 */
export function serialize({api}, done) {
  // TODO: This should probably just be another call to drafter.
  done(new Error('Not implemented yet!'));
}
