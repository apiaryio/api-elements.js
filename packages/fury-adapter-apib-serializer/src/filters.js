/*
 * Provides filters for templates.
 */

 /*
  * Indent a piece of multiline text by a number of spaces.
  * Setting `first` to `true` will also indent the first line.
  */
 export function indent(input, spaces, options = {first: false}) {
   let pre = '';
   let lines = [];

   for (let _ = 0; _ < spaces; _++) {
     pre += ' ';
   }

   for (const line of input.split('\n')) {
     // Only indent non-blank lines!
     lines.push(line ? pre + line : line);
   }

   lines = lines.join('\n').trim();

   if (options.first) {
     lines = pre + lines;
   }

   return lines;
 }

 /*
  * Given a message payload, return true if it only has a body defined and
  * optionally has a content-type and nothing else. This lets us know when to
  * use a shorthand syntax in the template.
  */
 export function bodyOnly(payload) {
   let headers;

   // First, we need to filter out the content-type header. This is handled
   // outside of the payload (e.g. `+ Response (application/json)`)
   if (payload.headers) {
     headers = payload.headers.exclude('Content-Type');
   }

   return payload.messageBody && !(
     headers.length || payload.dataStructure || payload.messageBodySchema ||
     payload.children(item => item.element === 'copy').length
   );
 }

 /*
  * Detect when it is okay to use a resource shorthand, i.e. skip the resource
  * header and just do a single action with a URI.
  */
 export function resourceShorthand(resource) {
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
 export function pretty(input) {
   let prettified;

   try {
     prettified = JSON.stringify(JSON.parse(input), null, 2);
   } catch (err) {
     prettified = input;
   }

   return prettified;
 }

 /*
  * Return all child elements with the element type of `copy` in a plain
  * old js array.
  */
 export function getCopy(element) {
   return element.children((item) => item.element === 'copy').content;
 }
