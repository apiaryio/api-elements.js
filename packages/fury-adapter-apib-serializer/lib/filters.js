/*
 * Provides filters for templates.
 */

/*
  * Indent a piece of multiline text by a number of spaces.
  * Setting `first` to `true` will also indent the first line.
  */
const indent = (input, spaces, options = { first: false }) => {
  let pre = '';
  let lines = [];

  for (let i = 0; i < spaces; i += 1) {
    pre += ' ';
  }

  input.split('\n').forEach((line) => {
    // Only indent non-blank lines!
    lines.push(line ? pre + line : line);
  });

  lines = lines.join('\n').trim();

  if (options.first) {
    lines = pre + lines;
  }

  return lines;
};

/*
  * Given a message payload, return true if it only has a body defined and
  * optionally has a content-type and nothing else. This lets us know when to
  * use a shorthand syntax in the template.
  */
const bodyOnly = (payload) => {
  // Headers, excluding content-type as that goes outside payload
  // (e.g. `+ Response (application/json)`)
  const hasHeaders = payload.headers && payload.headers.exclude('Content-Type').length > 0;

  return payload.content.length === 1 && payload.messageBody !== undefined && !hasHeaders;
};

/*
  * Detect when it is okay to use a resource shorthand, i.e. skip the resource
  * header and just do a single action with a URI.
  */
const resourceShorthand = resource => (!resource.title && !resource.description
           && resource.transitions.length === 1
           && resource.transitions.get(0).computedHref);

/*
  * Attempt to print out a pretty version of some input. Currently supported
  * inputs include:
  *
  * - JSON
  *
  */
const pretty = (input) => {
  let prettified;

  try {
    prettified = JSON.stringify(JSON.parse(input), null, 2);
  } catch (err) {
    prettified = input;
  }

  return prettified;
};

/*
  * Return all child elements with the element type of `copy` in a plain
  * old js array.
  */
const getCopy = element => element.children.filter(item => item.element === 'copy').elements;

module.exports = {
  getCopy, pretty, resourceShorthand, indent, bodyOnly,
};
