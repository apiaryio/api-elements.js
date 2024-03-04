# API Elements: OpenAPI 3 Serializer

[![NPM version](https://img.shields.io/npm/v/@apielements/openapi3-serializer.svg)](https://www.npmjs.org/package/@apielements/openapi3-serializer)
[![License](https://img.shields.io/npm/l/@apielements/openapi3-serializer.svg)](https://www.npmjs.org/package/@apielements/openapi3-serializer)

This adapter provides support for serializing [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3) in [Fury.js](https://github.com/apiaryio/api-elements.js/tree/master/packages/fury) from API Elements.

## Install

```sh
$ npm install @apielements/openapi3-serializer
```

## Usage

```js
const fury = require('fury');
const openapi3Serializer = require('@apielements/openapi3-serializer');

fury.use(openapi3Serializer);

// Assume `api` is a Minim element instance, e.g. from `fury.parse(...)`
fury.serialize({ api, mediaType: 'application/vnd.oai.openapi' }, (error, content) => {
    console.log(content);
});
```
