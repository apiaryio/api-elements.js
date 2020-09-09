# API Elements: Text Serializer

## Usage

Takes an API Element data structure, and returns Text serialized data
structures, for example:

### Async

```javascript
const { Fury } = require('@apielements/core');
const textSerializer = require('@apielements/text-serializer');

const fury = new Fury();
fury.use(textSerializer);

const api = new fury.minim.elements.String();
api.attributes.set('default', 'Doe');

const mediaType = 'text/plain';
fury.serialize({ api, mediaType }, (error, body) => {
  console.log(body);
  // "Doe"
});
```


### Sync

```javascript
const { Fury } = require('@apielements/core');
const textSerializer = require('@apielements/text-serializer');

const fury = new Fury();
fury.use(textSerializer);

const api = new fury.minim.elements.String('Doe');
const mediaType = 'text/plain';
try {
  const body = fury.serialize({ api, mediaType });
  console.log(body);
  // Doe
} catch (error) {
  console.log(error);
  // Only primitive elements can be serialized as text/plain
}
```
