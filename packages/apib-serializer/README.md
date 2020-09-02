# API Elements: API Blueprint Serializer

[![NPM version](https://img.shields.io/npm/v/@apielements/apib-serializer.svg)](https://www.npmjs.org/package/@apielements/apib-serializer)
[![License](https://img.shields.io/npm/l/@apielements/apib-serializer.svg)](https://www.npmjs.org/package/@apielements/apib-serializer)

This adapter provides support for serializing [API Blueprint](https://apiblueprint.org/) in [Fury.js](https://github.com/apiaryio/api-elements.js/tree/master/packages/fury) from refract elements.

## Install

```sh
$ npm install @apielements/apib-serializer
```

## Usage

### Async

```js
import fury from 'fury';
import apibSerializer from '@apielements/apib-serializer';

fury.use(apibSerializer);

// Assume `api` is a Minim element instance, e.g. from `fury.parse(...)`
fury.serialize({ api }, (err, content) => {
  fs.write('serialized.apib', content, 'utf8');
});
```

### Sync

```js
import fury from 'fury';
import apibSerializer from '@apielements/apib-serializer';

fury.use(apibSerializer);

try {
  // Assume `api` is a Minim element instance, e.g. from `fury.parse(...)`
  const content = fury.serializeSync({ api });
  fs.write('serialized.apib', content, 'utf8');
} catch (error) {
  console.log(error);
}
```
