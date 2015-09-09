# Minim API Description Namespace

[![Build Status](http://img.shields.io/travis/refractproject/minim-api-description.svg)](https://travis-ci.org/refractproject/minim-api-description) [![Coverage Status](http://img.shields.io/coveralls/refractproject/minim-api-description.svg)](https://coveralls.io/r/refractproject/minim-api-description) [![NPM version](http://img.shields.io/npm/v/minim-api-description.svg)](https://www.npmjs.org/package/minim-api-description) [![License](http://img.shields.io/npm/l/minim-api-description.svg)](https://www.npmjs.org/package/minim-api-description)

This library provides an interface to the [Refract API Description namespace](https://github.com/refractproject/refract-spec/blob/master/namespaces/api-description-namespace.md).

It extends upon the base types as defined in [Minim](https://github.com/refractproject/minim).

## Elements

* Category
* Copy
* DataStructure
* Resource
* Transition
* HttpTransaction
* HttpRequest
* HttpResponse
* Asset
* HrefVariables
* HttpHeaders

## Install

```sh
npm install minim-api-description
```

## Usage

```js
import minim from 'minim';
import apiDescription from 'minim-api-description';

const namespace = minim.namespace()
  .use(apiDescription);

// Convert from Compact Refract
let compactRefract = ['category', {'class': ['api'], title: 'My API'}, {}, []];
let api = namespace.fromCompactRefract(compactRefract);

// Initialize elements directly
const Category = namespace.getElementClass('category');
let category = new Category();
```
