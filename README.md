# Fury.js

[![Circle CI](https://circleci.com/gh/apiaryio/fury.js.svg?style=svg)](https://circleci.com/gh/apiaryio/fury.js)
[![Coverage Status](https://coveralls.io/repos/apiaryio/fury.js/badge.svg)](https://coveralls.io/r/apiaryio/fury.js)
[![Dependency Status](https://david-dm.org/apiaryio/fury.js.svg)](https://david-dm.org/apiaryio/fury.js)
[![devDependency Status](https://david-dm.org/apiaryio/fury.js/dev-status.svg)](https://david-dm.org/apiaryio/fury.js#info=devDependencies)

API Description SDK

> _Wardaddy: [Best job I ever had](http://www.imdb.com/title/tt2713180/quotes?item=qt2267083)._

Fury provides uniform interface to API description formats such as
[API Blueprint][].

## Usage

### Install

Fury.js is available as npm module.

Install globally:

```sh
$ npm install -g fury
```

or as a dependency:

```sh
$ npm install --save fury
```

### Refract Interface

Fury.js offers an interface based on the [Refract Project](https://github.com/refractproject/refract-spec) element specification and makes use of the API, resource, and MSON namespaces. Adapters convert from formats such as API Blueprint into Refract elements and Fury.js exposes these with API-related convenience functionality. For example:

```js
import * as fury from 'fury';
const source = '# My API\n...';

fury.parse({source}, function(err, api, warnings) {
  console.log(api.title);
});
```

Once you have a parsed API it is easy to traverse:

```js
api.resourceGroups.forEach(function (resourceGroup) {
  console.log(resourceGroup.title);

  resourceGroup.resources.forEach(function (resource) {
    console.log(resource.title);

    resource.transitions.forEach(function (transition) {
      console.log(transition.title);

      transition.transactions.forEach(function (transaction) {
        const request = transaction.request;
        const response = transaction.response;

        console.log(`${request.method} ${request.href}`);
        console.log(`${response.statusCode} (${response.header('Content-Type')})`);
        console.log(response.messageBody);
      });
    });
  });
});
```

It is also possible to do complex document-wide searching and filtering. For example, to print out a listing of HTTP methods and paths for all defined example requests:

```js
/*
 * Prints out something like:
 *
 * POST /frobs
 * GET /frobs
 * GET /frobs/{id}
 * PUT /frobs/{id}
 * DELETE /frobs/{id}
 */
function filterFunc(item){
  if (item.element === 'httpRequest' && item.statusCode === 200) {
    return true;
  }

  return false;
}

console.log('All API request URIs:');
api.find(filterFunc).forEach(function (request) {
  console.log(`${request.method} ${request.href}`)
});
```

### Legacy Interface

This is the older "legacy" interface for API Blueprint and Apiary Blueprint parsing.

#### API Blueprint Parsing

```js
var parser = require('fury').legacyBlueprintParser;
var source = '# My API\n';

parser.parse({ code: source }, function(error, api, warnings) {

    console.log(api.name);
});
```
#### Markdown Rendering

The legacy interface also offers access to Markdown rendered as used internally
by API and Apiary Blueprint parsers.

```js
var markdownRenderer = require('fury').legacyMarkdownRenderer;
var source = '# My API\n';


markdownRenderer.toHtml(source, {}, function(error, html) {

    console.log(html);
});
```

## Development

### Building & Testing
Parts of Fury.js are written in Coffeescript, so you must build the final library before it can be used. All of the build/test/etc commands are run through npm:

```sh
# Build the library
npm run compile

# Run the unit and integration tests
npm test

# Generate a coverage report
npm run coverage

# Open the HTML report
open coverage/lcov-report/index.html
```

[API Blueprint]: http://apiblueprint.org
