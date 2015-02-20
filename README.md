# Fury.js

[![Circle CI](https://circleci.com/gh/apiaryio/fury.svg?style=svg&circle-token=0eb5e9857fd6f82a0c5f52424a28ef35587293b0)](https://circleci.com/gh/apiaryio/fury)
[![Coverage Status](https://coveralls.io/repos/apiaryio/fury/badge.svg?branch=master)](https://coveralls.io/r/apiaryio/fury?branch=master)
[![Dependency Status](https://david-dm.org/apiaryio/fury.svg)](https://david-dm.org/apiaryio/fury)
[![devDependency Status](https://david-dm.org/apiaryio/fury/dev-status.svg)](https://david-dm.org/apiaryio/fury#info=devDependencies)

API Description SDK

> _Wardaddy: [Best job I ever had](http://www.imdb.com/title/tt2713180/quotes?item=qt2267083)._

Fury provides uniform interface to API description formats such as
[API Blueprint][].

## Usage

### Install

Fury.js is available as npm module.

Install globally:

```sh
$ npm install -g fury.js
```

or as a dependency:

```sh
$ npm install --save fury.js
```

### Interface

In the interim period Fury.js offers only "legacy" interface for API Blueprint
and Apiary Blueprint parsing:


```js
var parser = require('fury').legacyBlueprintParser
var source = '# My API\n';

parser.parse({ code: source }, function(error, api, warnings) {

    console.log(api.name);
});
```

[API Blueprint]: http://apiblueprint.org
