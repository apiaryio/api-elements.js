# API Elements JavaScript

This library provides an interface to [API Elements](http://apielements.org) in JavaScript.

## Install

```shell
$ npm install api-elements
```

## Usage

### Node

```javascript
const apiElements = require('api-elements');
const namespace = new apiElements.Namespace();


// Parsing a JSON Representation of API Elements tree
const parseResult = namespace.serialiser.deserialise({
  element: 'parseResult',
  content: []
});

console.log(parseResult);


// Creating API Elements directly
const parseResult = new namespace.elements.ParseResult();
console.log(parseResult);
```

## Elements

### ParseResult ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
An element that holds information about the result of parsing an input.

#### Properties

##### parseResult.annotations
Get an array element of all child elements with the element name `annotation`. This property is **read-only**.

```js
let annotations = parseResult.annotations;
```

##### parseResult.api
Get the first child element with an element name of `category` and a class name of `api`. This property is **read-only**.

```js
let api = parseResult.api;
```

##### parseResult.errors
Get an array element of all child elements with the element name `annotation` and class name `error`. This property is **read-only**.

```js
let errors = parseResult.errors;
```

##### parseResult.warnings
Get an array element of all child elements with the element name `annotation` and class name `warning`. This property is **read-only**.

```js
let warnings = parseResult.warnings;
```

### Annotation ([StringElement](https://github.com/refractproject/minim#stringelement))
An element that annotates the input or parse result with additional information, such as warnings or errors. The content of the annotation contains the text:

```js
console.log(`Warning: ${annotation.toValue()}`);
```

#### Properties

##### annotation.code
An optional warning, error, or other numerical code. This is a shortcut for accessing the element's `code` attribute.

```js
// Show the code
console.log(annotation.code.toValue());

// Set the code
annotation.code = 123;
```

### SourceMap (Element)
An element which maps a component of the parse result to the input via a given list of file locations and lengths.

The content of the source map is an array of locations.

#### Convenience function
You can use a convenience property to retrieve the sourceMap from any element.

```js
// Print [[1, 2]]
console.log(element.sourceMapValue);
```
