# API Elements: Remote Adapter

[![NPM version](https://img.shields.io/npm/v/@apielements/remote.svg)](https://www.npmjs.org/package/@apielements/remote)
[![License](https://img.shields.io/npm/l/@apielements/remote.svg)](https://www.npmjs.org/package/@apielements/remote)

This adapter provides support for parsing, validation and serialization via the [API Elements Web Service](https://api.apielements.org/) in [Fury](https://github.com/apiaryio/api-elements.js/tree/master/packages/fury).

The remote adapter can be configured to work with any API service compatible with [API Blueprint API](https://apiblueprintapi.docs.apiary.io).
By default the [API Elements Web Service](http://api.apielements.org/) is used.

```js
const defaultOptions = {
  // the default value, but consumers should be able to override to use their own deployment
  url: 'https://api.apielements.org',

  parseEndpoint: '/parser',
  validateEndpoint: '/validate',
  serializeEndpoint: '/composer',

  mediaTypes: {
    // the collection of "parse", media types we want this
    // instance of the adapter to handle.
    // NOTE, this allows you to use the API for one media type but
    // another local adapter for another.
    parse: [
      'text/vnd.apiblueprint',
      'application/swagger+json',
      'application/swagger+yaml',
      'application/vnd.oai.openapi',
      'application/vnd.oai.openapi+json',
    ],

    validate: [
      'text/vnd.apiblueprint',
      'application/swagger+json',
      'application/swagger+yaml',
      'application/vnd.oai.openapi',
      'application/vnd.oai.openapi+json',
    ],

    // the collection of "serialize", media types we want this
    // instance of the adapter to handle.
    serialize: [
      'text/vnd.apiblueprint',
    ],
  }
};
```

## Install

```sh
$ npm install @apielements/remote
```

## Usage

```js
const { Fury } = require('fury');
const FuryRemoteAdapter = require('@apielements/remote');

const fury = new Fury();
fury.use(new FuryRemoteAdapter(options);

fury.validate(...);
fury.parse(...);
fury.serialise(...);
```
