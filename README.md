# Refract API Description

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
* HttpMessagePayload
* Asset
* HrefVariables
* HttpHeaders

## Install

```sh
npm install refract-api-description
```

## Usage

```js
import { registry } from 'minim';
import { register, Category } from 'refract-api-description';

// Registry the API Description elements in any given registry
// This example uses Minim's global registry
// Note: this is required for converting to/from API Description elements
register(registry);

// Convert from Compact Refract
let compactRefract = ['category', {'class': ['api'], title: 'My API'}, {}, []];
let api = registry.fromCompactRefract(compactRefract);

// Initialize elements directly
let category = new Category();
```
