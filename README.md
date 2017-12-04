# Fury Swagger 2.0 Adapter

[![Greenkeeper badge](https://badges.greenkeeper.io/apiaryio/fury-adapter-swagger.svg)](https://greenkeeper.io/)

[![Build Status](https://img.shields.io/travis/apiaryio/fury-adapter-swagger.svg)](https://travis-ci.org/apiaryio/fury-adapter-swagger)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/github/apiaryio/fury-adapter-swagger.svg)](https://codeclimate.com/github/apiaryio/fury-adapter-swagger/coverage)
[![NPM version](https://img.shields.io/npm/v/fury-adapter-swagger.svg)](https://www.npmjs.org/package/fury-adapter-swagger)
[![License](https://img.shields.io/npm/l/fury-adapter-swagger.svg)](https://www.npmjs.org/package/fury-adapter-swagger)

This adapter provides support for parsing [Swagger 2.0](http://swagger.io/) in [Fury.js](https://github.com/apiaryio/fury.js). It does not yet provide a serializer.

Try the [Fury adapter in your browser](https://tonicdev.com/npm/fury-adapter-swagger) to convert Swagger 2.0 documents into Refract elements.

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

### Parser Codes

The following codes are used by the parser when creating warning and error annotations.

Warnings:

Code | Description
---: | -----------
   2 | Source maps are unavailable due either to the input format or an issue parsing the input.
   3 | Data is being lost in the conversion.

Errors:

Code | Description
---: | -----------
   1 | Error parsing input (e.g. malformed YAML).
   4 | Swagger validation error.
   5 | Swagger to Refract converter error (JS exception).

### Swagger Vendor Extensions

Some Swagger Vendor extensions found in source Swagger documents are converted
into the output API Element as extension elements.

The following locations of vendor extensions are supported:

- within the info object
- within the paths object
- within the path-item object
- within the operation object
- within the responses object

These vendor extensions will be available as extensions using the relation
[`https://help.apiary.io/profiles/api-elements/vendor-extensions/`](https://help.apiary.io/profiles/api-elements/vendor-extensions/).
