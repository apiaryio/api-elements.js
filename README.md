# API Elements: JavaScript

[API Elements](https://apielements.org/) is a uniform interface for dealing
with API description formats ([API Blueprint](https://apiblueprint.org/), [OpenAPI](https://github.com/OAI/OpenAPI-Specification), ...). This repository contains tooling for handling API
Elements in JavaScript along with parsers and serializers for API description
languages.

API Elements adapters:

- [API Blueprint Parser](packages/fury-adapter-apib-parser)
- [API Blueprint Serializer](packages/fury-adapter-apib-parser)
- [OpenAPI 2 Parser](packages/fury-adapter-swagger)
- [OpenAPI 3 Parser](packages/fury-adapter-oas3-parser)

## Usage

```javascript
const { Fury } = require('fury');

const fury = new Fury();

// Load any parsers or serializer adapters you wish to use
const apiBlueprintParser = require('fury-adapter-apib-parser');
fury.use(apiBlueprintParser);

const openAPI2Parser = require('fury-adapter-swagger');
fury.use(openAPI2Parser);

const source = `
FORMAT: 1A

# My API
## GET /message
+ Response 200 (text/plain)

        Hello World!
`;

fury.parse({source}, (error, parseResult) => {
  console.log(parseResult.api.title);
});
```

See [API Reference documentation](https://api-elements-js.readthedocs.io/en/latest/api.html#elements)
for the details about the ParseResult object and other elements interface in
JavaScript.

[API Elements
Reference](https://apielements.org/en/latest/element-definitions.html) contains
information regarding the design of various API Elements.

## Development

### Using Lerna

Install dependencies of all packages:

```shell
$ npm install --global yarn
$ yarn
```

> **NOTE**: Please do commit the `yarn.lock` to the GitHub repo

To list all packages:

```shell
$ npx lerna ls -a -l
```

To add a new dependency to a package:

```shell
$ npx lerna add --scope='package_name' dep@version
```

To run tests for a single package:

```shell
$ npx lerna exec --scope='package_name' -- npm run test
```

### Documentation

The documentation is built using Sphinx, a Python tool. Assuming you have
Python 3 installed, the following steps can be used to build the site.

```shell
$ python3 -m venv venv
$ source venv/bin/activate
$ cd docs/
$ pip install -r requirements.txt
```

#### Running the Development Server

You can run a local development server to preview changes using the following:

```shell
$ make watch
```
