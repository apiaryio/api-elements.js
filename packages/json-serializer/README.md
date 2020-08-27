# API Elements: JSON Serializer

## Usage

Takes an API Element data structure, and returns JSON serialized data
structures, for example:

### Async

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


### Sync

```javascript
const { Fury } = require('@apielements/core');
const jsonSerializer = require('@apielements/json-serializer');

const fury = new Fury();
fury.use(jsonSerializer);

const name = new fury.minim.elements.String();
name.attributes.set('default', 'Doe');

const api = new fury.minim.elements.Object({ name });
const mediaType = 'application/json';
try {
  const body = fury.serialize({ api, mediaType });
  console.log(body);
  // {
  //   "name": "Doe"
  // }
} catch (error) {
  console.log(error);
  // Media type did not match any registered serializer!
}
```