# Fury API Blueprint Parser

[![NPM version](https://img.shields.io/npm/v/fury-adapter-apib-parser.svg)](https://www.npmjs.org/package/fury-adapter-apib-parser)
[![License](https://img.shields.io/npm/l/fury-adapter-apib-parser.svg)](https://www.npmjs.org/package/fury-adapter-apib-parser)

This adapter provides support for parsing [API Blueprint](https://apiblueprint.org/) in [Fury.js](https://github.com/apiaryio/api-elements.js/tree/master/packages/fury) using the Node API Blueprint parser [Drafter NPM](https://github.com/apiaryio/drafter-npm).

## Install

```sh
npm install fury-adapter-apib-parser
```

## Usage

```js
import fury from 'fury';
import apibParser from 'fury-adapter-apib-parser';

fury.use(apibParser);

fury.parse({source: '... your API Blueprint ...'}, (err, result) => {
  if (err) {
    console.log(err);
    return;
  }

  // The returned `result` is a Minim parse result element.
  console.log(result.api.title);
});
```
