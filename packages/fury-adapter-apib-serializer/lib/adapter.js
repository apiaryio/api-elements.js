/*
 * API Blueprint serializer for Fury.js
 */

const nunjucks = require('nunjucks');
const path = require('path');
const { renderAttributes, renderDataStructure } = require('./mson');

const { indent, bodyOnly, resourceShorthand, pretty, getCopy } = require('./filters');

const env = nunjucks.configure(path.dirname(__dirname), {
  autoescape: false,
});

env.addFilter('mson', renderAttributes);
env.addFilter('dataStructure', renderDataStructure);
env.addFilter('indent', indent);
env.addFilter('bodyOnly', bodyOnly);
env.addFilter('resourceShorthand', resourceShorthand);
env.addFilter('pretty', pretty);
env.addFilter('getCopy', getCopy);

const name = 'api-blueprint-serializer';
const mediaTypes = [
  'text/vnd.apiblueprint',
];

/*
 * Serialize an API into API Blueprint.
 */
function serialize({ api }, done) {
  nunjucks.render('template.nunjucks', { api }, (err, apib) => {
    if (err) {
      return done(err);
    }

    // Attempt to filter out extra spacing
    return done(null, apib.replace(/\n\s*\n\s*\n/g, '\n\n'));
  });
}

module.exports = { name, mediaTypes, serialize };
