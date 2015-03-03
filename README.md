# Fury.js

[![Circle CI](https://circleci.com/gh/apiaryio/fury.js.svg?style=svg)](https://circleci.com/gh/apiaryio/fury.js)
[![Coverage Status](https://coveralls.io/repos/apiaryio/fury.js/badge.svg)](https://coveralls.io/r/apiaryio/fury.js)
[![Dependency Status](https://david-dm.org/apiaryio/fury.js.svg)](https://david-dm.org/apiaryio/fury.js)
[![devDependency Status](https://david-dm.org/apiaryio/fury.js/dev-status.svg)](https://david-dm.org/apiaryio/fury.js#info=devDependencies)

API Description SDK

> _Wardaddy: [Best job I ever had](http://www.imdb.com/title/tt2713180/quotes?item=qt2267083)._

Fury provides uniform interface to API description formats such as
[API Blueprint][].

## Usage

### Install

Fury.js is available as npm module.

Install globally:

```sh
$ npm install -g fury
```

or as a dependency:

```sh
$ npm install --save fury
```

### Interface

#### API Blueprint Parsing

In the interim period Fury.js offers only "legacy" interface for API Blueprint
and Apiary Blueprint parsing:


```js
var parser = require('fury').legacyBlueprintParser
var source = '# My API\n';

parser.parse({ code: source }, function(error, api, warnings) {

    console.log(api.name);
});
```
#### Markdown Rendering

```js
```


[API Blueprint]: http://apiblueprint.org
