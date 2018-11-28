# Contributing to API Elements OAS Parser

## Resources

- [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
- [API Elements](https://apielements.org/)
- [API Elements JS](https://api-elements-js.readthedocs.io/en/latest/)
- [Ramda](https://ramdajs.com/)

## Parser Structure

The parser is split into multiple components, there is a separate component to
parse each element of an OpenAPI document, this makes it easier to test
specific components and promotes reuse. The project uses
[JSDoc](http://usejsdoc.org/) to document the high level parsing components and
also the reusable components. It can be helpful to build API documentation
using JSDoc while developing the parser (`npm install --global jsdoc && jsdoc
-r lib/` and then look in `out/index.html`).

fury-adapter-oas3-parser is in early stages and lots of functionality will
return warnings when a user tries to use a feature in OAS that is unsupported.
When writing a parser for a particular area of OpenAPI ensure that all
unsupported features return a warning to the user and place a `FIXME` comment,
that way it is easier to identify and track unsupported functionality.

There is a 1-1 mapping between definitions described in the [Open API
Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schema)
and our code base.

For example, the code responsible for parsing the OpenAPI `Operation Object` is
found within `lib/parser/oas/parseOperationObject.js` and the respective tests
would be found in `test/parser/oas/parseOperationObject-test.js`.

The module `parseOperationObject` would accept a [minim
namespace](https://api-elements-js.readthedocs.io/en/latest/api.html#namespace)
and the given `Operation Object`. It is expected that the parser is a [curried
function](https://fr.umio.us/favoring-curry/) and it would return a
[`ParseResult`](https://api-elements-js.readthedocs.io/en/latest/api.html#parse-result)
including the result or any warnings or errors. There is a collection of
high-order functions such as `pipeParseResult` and `parseObject` to make it
easier to handle a parse result.

Below is an example parser component for an OpenAPI Schema Definition, it can
be used as a template when creating new parser components:

```js
// lib/parser/oas/parseOperationObject.js

const R = require('ramda');
const { createWarning } = require('../annotations');

const name = 'Operation Object';

/**
 * Parse Operation Object
 *
 * @param minim {Namespace}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject
 */
function parseOperationObject(minim, element) {
  const unsupportedAnnotation = createWarning(minim, `'${name}' is unsupported`, element);
  return new minim.elements.ParseResult([unsupportedAnnotation]);
}

module.exports = R.curry(parseOperationObject);
```

```js
// test/parser/oas/parseOperationObject-test.js

const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseOperationObject');

const { minim } = new Fury();

describe('Operation Object', () => {
  it('returns an unsupported warning', () => {
    const operation = new minim.elements.Object();
    const result = parse(minim, operation);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Operation Object' is unsupported"
    );
  });
});
```
