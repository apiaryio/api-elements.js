# Minim Parse Result Namespace

[![Build Status](https://img.shields.io/travis/refractproject/minim-parse-result.svg)](https://travis-ci.org/refractproject/minim-parse-result) [![Coverage Status](https://img.shields.io/coveralls/refractproject/minim-parse-result.svg)](https://coveralls.io/r/refractproject/minim-parse-result) [![NPM version](https://img.shields.io/npm/v/minim-parse-result.svg)](https://www.npmjs.org/package/minim-parse-result) [![License](https://img.shields.io/npm/l/minim-parse-result.svg)](https://www.npmjs.org/package/minim-parse-result)

This library provides an interface to the [Refract Parse Result namespace](https://github.com/refractproject/refract-spec/blob/master/namespaces/parse-result-namespace.md).

It extends upon the base types as defined in [Minim](https://github.com/refractproject/minim) and should be used with the [minim-api-description](https://github.com/refractproject/minim-api-description) package.

## Elements

### ParseResult ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
An element that holds information about the result of parsing an input.

#### Properties

##### parseResult.annotations
Get an array element of all child elements with the element name `annotation`. This property is **ready-only**.

```js
let annotations = parseResult.annotations;
```

##### parseResult.api
Get the first child element with an element name of `category` and a class name of `api`. This property is **ready-only**.

```js
let api = parseResult.api;
```

##### parseResult.errors
Get an array element of all child elements with the element name `annotation` and class name `error`. This property is **ready-only**.

```js
let errors = parseResult.errors;
```

##### parseResult.warnings
Get an array element of all child elements with the element name `annotation` and class name `warning`. This property is **ready-only**.

```js
let warnings = parseResult.warnings;
```

### Annotation ([StringElement](https://github.com/refractproject/minim#stringelement))
An element that annotates the input or parse result with additional information, such as warnings or errors. The content of the annotation contains the text:

```js
console.log(`Warning: ${annotation.getValue()}`);
```

#### Properties

##### annotation.code
An optional warning, error, or other numerical code. This is a shortcut for accessing the element's `code` attribute value.

```js
// Show the code
console.log(annotation.code);

// Set the code
annotation.code = 123;
```

### SourceMap (Element)
An element which maps a component of the parse result to the input via a given list of file locations and lengths.

The content of the source map is an array of locations.

## Install

```sh
npm install minim-parse-result
```

## Usage

```js
import minim from 'minim';
import parseResult from 'minim-parse-result';

const namespace = minim.namespace()
  .use(parseResult);

// Initialize elements directly
const ParseResult = namespace.getElementClass('parseResult');
let category = new ParseResult();
```
