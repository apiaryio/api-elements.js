import Drafter from 'drafter';
import path from 'path';
import swig from 'swig';

// Auto-detect via the API Blueprint format metadata.
const FORMAT1A = /^[\uFEFF]?(((VERSION:( |\t)2)|(FORMAT:( |\t)(X-)?1A))\n)/i;

const TEMPLATE = path.join(
  __dirname, '..', '..', 'templates', 'api-blueprint.swig');

/*
 * Indent every line except the first by a number of spaces.
 *
 * e.g. indent('foo\nbar\nbaz', 4)
 *      => 'foo\n    bar\n    baz'
 */
function indent(input, spaces) {
  let pre = '';
  let lines = [];

  for (let _ = 0; _ < spaces; _++) {
    pre += ' ';
  }

  for (let line of input.split('\n')) {
    lines.push(pre + line);
  }

  return lines.join('\n').trim();
}

/*
 * Given a message payload, return true if it only has a body defined and
 * optionally has a content-type and nothing else. This lets us know when to
 * use a shorthand syntax in the template.
 */
function bodyOnly(payload) {
  let headers;

  // First, we need to filter out the content-type header. This is handled
  // outside of the payload (e.g. `+ Response (application/json)`)
  if (payload.headers) {
    headers = payload.headers.exclude('Content-Type');
  }

  return payload.messageBody && !(headers.length || payload.dataStructure ||
                                  payload.messageBodySchema);
}

/*
 * Detect when it is okay to use a resource shorthand, i.e. skip the resource
 * header and just do a single action with a URI.
 */
function resourceShorthand(resource) {
  return (!resource.title && !resource.description &&
          resource.transitions.length === 1 &&
          resource.transitions.get(0).computedHref);
}

/*
 * Attempt to print out a pretty version of some input. Currently supported
 * inputs include:
 *
 * - JSON
 *
 */
function pretty(input) {
  let prettified;

  try {
    prettified = JSON.stringify(JSON.parse(input), null, 2);
  } catch (err) {
    prettified = input;
  }

  return prettified;
}

swig.setFilter('indent', indent);
swig.setFilter('bodyOnly', bodyOnly);
swig.setFilter('resourceShorthand', resourceShorthand);
swig.setFilter('pretty', pretty);

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
  let template;
  let output;

  try {
    template = swig.compileFile(TEMPLATE, {autoescape: false});
  } catch (err) {
    return done(err);
  }

  try {
    output = template({api});
  } catch (err) {
    return done(err);
  }

  // Attempt to filter out extra spacing
  output = output.replace(/\n\s*\n\s*\n/g, '\n\n');
  done(null, output);
}
