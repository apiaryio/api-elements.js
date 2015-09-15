/*
 * API Blueprint serializer for Fury.js
 */

import mson from './mson';
import nunjucks from 'nunjucks';
import path from 'path';

import {indent, bodyOnly, resourceShorthand, pretty, getCopy} from './filters';

const env = nunjucks.configure(path.dirname(__dirname), {
  autoescape: false,
});

env.addFilter('mson', mson);
env.addFilter('indent', indent);
env.addFilter('bodyOnly', bodyOnly);
env.addFilter('resourceShorthand', resourceShorthand);
env.addFilter('pretty', pretty);
env.addFilter('getCopy', getCopy);

export const name = 'api-blueprint-serializer';
export const mediaTypes = [
  'text/vnd.apiblueprint',
];

/*
 * Serialize an API into API Blueprint.
 */
export function serialize({api}, done) {
  nunjucks.render('template.nunjucks', {api}, (err, apib) => {
    if (err) {
      return done(err);
    }

    // Attempt to filter out extra spacing
    done(null, apib.replace(/\n\s*\n\s*\n/g, '\n\n'));
  });
}

export default {name, mediaTypes, serialize};
