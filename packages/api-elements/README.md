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
