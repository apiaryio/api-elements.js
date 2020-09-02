# API Elements: Core

[![NPM version](https://img.shields.io/npm/v/@apielements/core.svg)](https://www.npmjs.org/package/@apielements/core)
[![License](https://img.shields.io/npm/l/@apielements/core.svg)](https://www.npmjs.org/package/@apielements/core)

API Description SDK

> _Wardaddy: [Best job I ever had](http://www.imdb.com/title/tt2713180/quotes?item=qt2267083)._

Fury provides uniform interface to API description formats such as
[API Blueprint](https://apiblueprint.org) and [Swagger](http://swagger.io/).

Note: Fury requires *adapters* to support parsing and serializing. You will need to install at least one adapter along with Fury. You can [find Fury adapters](https://www.npmjs.com/search?q=fury-adapter) via npm.

## Usage

### Install

Fury.js is available as an npm module.

```sh
$ npm install --save @apielements/core
```

### Refract Interface

Fury.js offers an interface based on the [Refract Project](https://github.com/refractproject/refract-spec) element specification and makes use of the API description and data structure namespaces. Adapters convert from formats such as API Blueprint into Refract elements and Fury.js exposes these with API-related convenience functionality. For example:

```js
import fury from '@apielements/core';
import apibParser from '@apielements/apib-parser';

// The input as a string
const source = 'FORMAT: 1A\n# My API\n...';

// Use the API Blueprint parser adapter
fury.use(apibParser);

// Parse the input and print 'My API'
const parseResult = await fury.parse({ source });
console.log(parseResult.api.title);
```

Once you have a parsed API it is easy to traverse:

```js
parseResult.api.resourceGroups.forEach(function (resourceGroup) {
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
function filterFunc(item) {
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

Reference:

* [Minim](https://github.com/refractproject/minim)

#### Multiple Fury Instances

There may come a day when you need to have multiple Fury instances with different adapters or other options set up in the same program. This is possible via the `Fury` class:

```js
import {Fury} from '@apielements/core';

const fury1 = new Fury();
const fury2 = new Fury();

await fury1.parse(...);
```

#### Writing an Adapter

Adapters convert from an input format such as API Blueprint into refract elements. This allows a single, consistent interface to be used to interact with multiple input API description formats. Writing your own adapter allows you to add support for new input formats.

Note about `mediaTypes`: it allows two kinds of definitions. First one is **array** type. It is intended to "catch all" implementation.
It is useful if your adapter implements only one of fury methods, or if all methods accepts same types of Media Type.

Another possible option is to use object with mapping name of method to array of MediaTypes. It allows better granularity for detection.

Examples:

If your adapter support just one method or all methods supports same kind of input Media Type:

```js
export const mediaTypes = ['text/vnd.my-adapter'];
```

If you need to distinguish among supported input Media Types for methods use:

```js
export const mediaTypes = {
  parse: ['text/vnd.my-parsing', 'text/vnd.another-supported-parsing'],
  serialize: ['text/vnd.my-serialization'],
};
```


Adapters are made up of a name, a list of media types, and up to four optional public functions: `detect`, `parse`, `serialize` and `serializeSync`. A simple example might look like this:

```js
export const name = 'my-adapter';
export const mediaTypes = ['text/vnd.my-adapter'];

export function detect(source[, method]) {
  // If no media type is know, then we fall back to auto-detection. Here you
  // can check the source and see if you think you can parse it.
  // 
  // optional parmeter `method` give you hint about caller is going to invoke
  // note that value can be undefined
  return source.match(/some-test/i) !== null;
}

export async function parse({minim, generateSourceMap, mediaType, source}) {
  // Here you convert the source into refract elements. Use the `minim`
  // variable to access refract element classes.
  const Resource = minim.getElementByClass('resource');
  // ...
  return elements;
}

export async function validate({minim, mediaType, source}) {
  // Here you validate the source and return a parse result for any warnings or
  // errors.
  //
  // NOTE: Implementing `validate` is optional, Fury will fallback to using
  // `parse` to find warnings or errors.
  return null;
}

export async function serialize({api, mediaType, minim}) {
  // Here you convert `api` from javascript element objects to the serialized
  // source format.
  // ...
  return outputString;
}

export function serializeSync({api, mediaType, minim}) {
  // Here you convert `api` from javascript element objects to the serialized
  // source format.
  // ...
  return outputString;
}

export default {name, mediaTypes, detect, parse, serialize, serializeSync};
```

Now you can register your adapter with Fury.js:

```js
import fury from '@apielements/core';
import myAdapter from './my-adapter';

// Register my custom adapter
fury.use(myAdapter);

// Now parse my custom input format!
const parseResult = await fury.parse({ source: 'some-test\n...' });
console.log(parseResult.api.title);
```
