# API Elements: Apiary Blueprint Parser

[![NPM version](https://img.shields.io/npm/v/@apielements/apiaryb-parser.svg)](https://www.npmjs.org/package/@apielements/apiaryb-parser)
[![License](https://img.shields.io/npm/l/@apielements/apiaryb-parser.svg)](https://www.npmjs.org/package/@apielements/apiaryb-parser)

This adapter provides support for parsing the deprecated [Apiary
Blueprint](https://github.com/apiaryio/blueprint-parser) format in
[Fury.js](https://github.com/apiaryio/api-elements.js/tree/master/packages/fury). *We do not recommend using this
adapter in any new development, it's only used for backwards compatibility with
the legacy format.

## Installation

```shell
$ npm install @apielements/apiaryb-parser
```

## Usage

```javascript
import fury from 'fury';
import apiaryBlueprintAdapter from '@apielements/apiaryb-parser';

fury.use(apiaryBlueprintAdapter);

fury.parse({source: '--- Your Legacy Apiary Blueprint'}, (err, result) => {
  if (err) {
    console.log(err);
    return;
  }

  // The returned `result` is a Minim parse result element.
  console.log(result.api.title);
});
```
