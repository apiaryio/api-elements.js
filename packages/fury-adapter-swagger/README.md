# Fury Swagger 2.0 Adapter

[![NPM version](https://img.shields.io/npm/v/fury-adapter-swagger.svg)](https://www.npmjs.org/package/fury-adapter-swagger)
[![License](https://img.shields.io/npm/l/fury-adapter-swagger.svg)](https://www.npmjs.org/package/fury-adapter-swagger)

This adapter provides support for parsing [Swagger 2.0](http://swagger.io/) in [Fury](https://github.com/apiaryio/api-elements.js/tree/master/packages/fury). It does not yet provide a serializer.

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
- within the security-scheme object

These vendor extensions will be available as extensions using the relation
[`https://help.apiary.io/profiles/api-elements/vendor-extensions/`](https://help.apiary.io/profiles/api-elements/vendor-extensions/).
