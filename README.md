# Fury Swagger 2.0 Adapter

[![Build Status](https://img.shields.io/travis/apiaryio/fury-adapter-swagger.svg)](https://travis-ci.org/apiaryio/fury-adapter-swagger) [![Coverage Status](https://img.shields.io/coveralls/apiaryio/fury-adapter-swagger.svg)](https://coveralls.io/r/apiaryio/fury-adapter-swagger) [![NPM version](https://img.shields.io/npm/v/fury-adapter-swagger.svg)](https://www.npmjs.org/package/fury-adapter-swagger) [![License](https://img.shields.io/npm/l/fury-adapter-swagger.svg)](https://www.npmjs.org/package/fury-adapter-swagger)

This adapter provides support for parsing [Swagger 2.0](http://swagger.io/) in [Fury.js](https://github.com/apiaryio/fury.js)). It does not yet provide a serializer.

## Install

```sh
npm install fury-adapter-swagger
```

## Usage

```js
import fury from 'fury';
import swaggerAdapter from 'fury-adapter-swagger';

fury.use(swaggerAdapter);

fury.parse({source: '... your Swagger 2.0 document ...'}, (err, result) => {
  if (err) {
    console.log(err);
    return;
  }

  // The returned `result` is a Minim parse result element.
  console.log(result.api.title);
});
```
