# Minim API Description Namespace

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
