# API Elements: JSON Serializer

## Usage

Takes an API Element data structure, and returns JSON serialized data
structures, for example:

```javascript
const { Fury } = require('@apielements/core');
const jsonSerializer = require('@apielements/json-serializer');

const fury = new Fury();
fury.use(jsonSerializer);

const name = new fury.minim.elements.String();
name.attributes.set('default', 'Doe');

const api = new fury.minim.elements.Object({ name });
const mediaType = 'application/json';
fury.serialize({ api, mediaType }, (error, body) => {
  console.log(body);
  // {
  //   "name": "Doe"
  // }
});
```
