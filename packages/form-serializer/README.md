# API Elements: Multipart / Form data serializer

## Usage

```js
const formSerializer = require('@apielements/form-serializer');
fury.use(formSerializer);

const mediaType = 'multipart/form-data';
fury.serialize({ api, mediatype }, (error, body) => {
    console.log(body);
});
```
