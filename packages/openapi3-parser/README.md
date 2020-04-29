# API Elements: OpenAPI 3 Parser

## Current Status

The API Elements [OpenAPI][] 3 Parser is in early stages and does not provide
full support for OpenAPI. The parser will emit warnings for unsupported
functionality. You can reference [status document][] to check the current state
of support for each feature.

## Usage

Install Fury and the Open API 3 Adapter including minim.

```shell
$ npm install @apielements/openapi3-parser
```

```js
const { Fury } = require('fury');
const openapi3Adapter = require('@apielements/openapi3-parser');

// Add the OpenAPI 3 Adapter to Fury
fury.use(openapi3Adapter);

fury.parse({source: '... your OpenAPI 3 Document ...'}, (err, parseResult) => {
  console.log(parseResult.api.title);
});
```

Read [API Elements JS: Parse
Result](https://api-elements-js.readthedocs.io/en/latest/api.html#parse-result)
for information regarding the Parse Result type.

## Contributing

If you are trying to integrate the OpenAPI 3 adapter or use a product which
utilises API Elements then we welcome any feedback you may have on the adapter
in our issue tracker. You can find open issues tracking unsupported
functionality with the next steps to be supported. For [1.0.0 Milestone][] we
will only be focussing on initial support for OpenAPI 3, there are some OpenAPI
3 features which require some design thought and a future release of [API
Elements][].

We have tagged some issues with "[good first issue][]" to indicate that they
are some simpler tasks great for first time contributors. You can find
information about how the parser works and related resources in our
[contributing
document](https://github.com/apiaryio/api-elements.js/blob/master/packages/openapi3-parser/CONTRIBUTING.md).

Be sure to check an
issue is not assigned by someone else to prevent wasted efforts.


[API Elements]: https://apielements.org/
[OpenAPI]: https://github.com/OAI/OpenAPI-Specification
[status document]: https://github.com/apiaryio/api-elements.js/tree/master/packages/openapi3-parser/STATUS.md
[1.0.0 Milestone]: https://github.com/apiaryio/api-elements.js/milestone/1
[good first issue]: https://github.com/apiaryio/api-elements.js/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aopenapi3+label%3A%22good+first+issue%22
