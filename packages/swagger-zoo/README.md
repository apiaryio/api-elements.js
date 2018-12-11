# Swagger Zoo

This repository contains a collection of [Swagger](http://swagger.io/) sample files and their parsed [Refract](https://github.com/refractproject/refract-spec) results. These files are suitable for testing.

## Usage

You can use it either as an `npm` module or a `git` submodule.

**npm**

First, install the module:

```sh
npm install swagger-zoo
```

Then use it:

```js
import zoo from 'swagger-zoo';

// Features are tiny examples of various Swagger features
for (const feature of zoo.features()) {
  console.log(`Feature: ${feature.name}`);

  // String of the swagger source
  console.log(feature.swagger);

  // The api-elements is loaded as an object, so we stringify it
  // here to print it out.
  console.log(JSON.stringify(feature.apiElements, null, 2));

  // The api-elements with source maps is also loaded similarly
  console.log(JSON.stringify(feature.apiElementsSourceMap, null, 2));
}

// Examples are real-world API examples
for (const example of zoo.examples()) {
  console.log(`Example: ${example.name}`);
  console.log(example.swagger);
  console.log(JSON.stringify(example.apiElements, null, 2));
  console.log(JSON.stringify(example.apiElementsSourceMap, null, 2));
}

// Or, you can easily get all of the above together in one go
for (const sample of zoo.samples()) {
  console.log(`Sample: ${sample.name}`);
  console.log(sample.swagger);
  console.log(JSON.stringify(sample.apiElements, null, 2));
  console.log(JSON.stringify(sample.apiElementsSourceMap, null, 2));
}
```

**git**

If you are not using Javascript or a related language, then you can still get the test files using `git`:

```sh
$ git submodule add https://github.com/apiaryio/api-elements.js
```

The files are in `api-elements.js/packages/swagger-zoo/fixtures/features` and `api-elements.js/packages/swagger-zoo/fixtures/examples`, which correspond to the Javascript functions explained above.
