# API Elements: Multipart / Form data serializer

## Usage

### Async

```js
const { Fury } = require('@apielements/core');
const formSerializer = require('@apielements/form-serializer');

const fury = new Fury();
fury.use(formSerializer);

const api = new namespace.elements.DataStructure(
    new namespace.elements.String('Hello world')
);
const mediaType = 'multipart/form-data';
fury.serialize({ api, mediatype }, (error, body) => {
    console.log(body);
    // --BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n
});
```

### Sync

```js
const { Fury } = require('@apielements/core');
const formSerializer = require('@apielements/form-serializer');

const fury = new Fury();
fury.use(formSerializer);

const api = new namespace.elements.DataStructure(
    new namespace.elements.String('Hello world')
);
const mediaType = 'multipart/form-data';
try {
    const body = fury.serializeSync({ api, mediatype });
    console.log(body);
    // --BOUNDARY\r\nContent-Disposition: form-data; name="undefined"\r\n\r\nHello world\r\n--BOUNDARY--\r\n
} catch (error) {
    console.log(error);
    // Media type did not match any registered serializer!
}
```
