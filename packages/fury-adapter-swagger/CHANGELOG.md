# Fury Swagger Parser Changelog

## 0.29.0 (2020-04-20)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 14](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.14).

- The parser can now be configured to disable generation of example message
  bodies and message body schemas by providing an adapter option
  `generateMessageBody` or `generateMessageBodySchema` as `false` during parse.

## 0.28.3 (2020-03-16)

### Enhancements

- Adds support for `info.termsOfService`.
  For example the following document:

  ```yaml
  swagger: '2.0'
  info:
    termsOfService: http://example.com/terms/
  ```

  will add the link to the terms of service `http://example.com/terms/`

- Adds support for `info.contact`.
  For example the following document:

  ```yaml
  swagger: '2.0'
  info:
    url: http://www.example.com/support
    email: support@example.com
  ```

  will add a link to the contact URL and a second link to the contact email

## 0.28.2 (2020-02-07)

### Bug Fixes

- This release includes performance improvements to parsing documents which
  contain the same schema re-used via a reference (`$ref`) many times in
  request parameters and response bodies.

## 0.28.1 (2020-01-30)

### Bug Fixes

- Sets an explicit `$schema` property on JSON Schema generated from a Swagger
  document in `convertSchema`. Sets a JSON Schema Draft V4 as the value of the
  `$schema` property, making generated schema implement a JSON Schema Draft V4.

## 0.28.0 (2019-12-06)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 13](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.13).

## 0.27.2 (2019-08-08)

### Bug Fixes

- Prevents a 'Path Item Object' from being included in a Resource Group created
  by an 'Operation Object' in a previously defined 'Path Item Object'.

- Optional parameters will now include an optional typeAttribute in the parse
  result. This will fix conversion to API Blueprint with fury-cli where
  optional parameters have shown up as required in the generated API Blueprint.

- Allows generating of JSON bodies for schemas which make use of `allOf` and
  include circular references. Under some circumstances this would previously
  fail, and a warning may have been emitted "Unable to generate
  application/json example message body out of JSON Schema"

## 0.27.1 (2019-06-03)

### Bug Fixes

- Fixes a problem while parsing a document which contains a Swagger Schema for
  a string which contains both a `minLength` and a `pattern` property which are
  incompatible. For example, the following pattern: `^[A-z]*$` which is making
  use of `*` which means that it allows strings that are zero length or more.
  If there is a property `minLength` which is incompatible with the pattern
  such as if `minLength` is set to 1. Previously this would cause the parser to
  get into an infinite loop.

## 0.26.0 (2019-06-11)

### Breaking

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is
  recommended.

### Bug Fixes

- JSON value generation will now support schemas which contain an array of objects.
  For example, the following schema:

  ```yaml
  type: array
  items:
    type: object
    properties:
      name:
        type: string
        example: doe
  ```

  Will now emit a JSON value of `[{ "name": "doe" }]`, whereas before it would
  emit an empty array `[]`.

  [#236](https://github.com/apiaryio/api-elements.js/issues/236)

- While parsing an 'Example Object' (found in a 'Schema Object') which contains
  an object with a property `length` anywhere in the example tree. The example
  object will be interpreted as an array of the given length. If the value of
  `length` property of an 'Example Object' is a large number, then the parser
  may utilise a lot of memory while producing a result and subsequently may
  cause out of memory failures.

  For example:

  ```yaml
  definitions:
    User:
      type: object
      example:
        length: 50000
  ```

## 0.25.1 (2019-04-26)

### Bug Fixes

- Fixes a potential parser crash while handling an example value for a 'Schema
  Object' which contains an invalid reference.

## 0.25.0 (2019-03-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 10](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.10).

## 0.24.2 (2019-03-15)

### Bug Fixes

- Support JSON Body generation when a schema contains an unknown "format".
  Previously this would cause a warning:

  > Unable to generate application/json example message body out of JSON Schema

## 0.24.1 (2019-03-05)

### Bug Fixes

- Supports data structure generation for references for a value inside another
  definition. For example a reference to `#/definitions/User/properties/name`.

- Removes duplicate description values placed on members for data structure
  properties.

## 0.24.0 (2019-02-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 9](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.9).

### Bug Fixes

- Removed uses of `process.nextTick` which could cause any exceptions raised by
  the Fury adapter to be uncaught exceptions in Node JS.
  https://github.com/apiaryio/fury-adapter-swagger/issues/169

## 0.23.2 (2019-01-25)

### Bug Fixes

- Fix cases where example values in schema definitions are not used in request
  or response bodies.

## 0.23.1 (2019-01-10)

### Bug Fixes

- Fixes a case where having `null` as an enum value or having
  `x-nullable: true` on a schema with `enum` will cause an obscure error:

  > Cannot read property '$ref' of null

## 0.23.0 (2018-12-21)

### Breaking

- Swagger Parser now requires [Fury 3.0.0 Beta 8](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.8).

## 0.22.7 (2018-12-11)

### Bug Fixes

- Adds support for generating JSON bodies for schemas where the root is an
  array. For example, given following array schema:

  ```yaml
  type: array
  items:
    type: string
    example: Doe
  ```

  The parser will now generate a JSON body of `["Doe"]` whereas in previous
  versions would've resulted in an empty array.

- Fixes parsing Swagger documents that contain properties called `$ref`.
  Previously the parser would attempt to dereference the property as would
  generically try to dereference any key in an object called `$ref`, as per the
  JSON Schema specification, references are only permitted when a schema type
  is expected.

  For example, the following is a schema which is trying to describe an object
  with a property called `$ref`, previously the parser would attempt to
  dereference `$ref` and crash in the process.

  ```yaml
  type: object
  properties:
    $ref:
      type: string
      example: '#/definitions/User'
  required: ['$ref']
  ```

  There is a still an open known issue
  [#235](https://github.com/apiaryio/fury-adapter-swagger/issues/235) that
  uses of `$ref` in a Swagger 2 document where the value a string will cause
  the parser to attempt to dereference it incorrectly when the `$ref` property
  is found on an object that does not support `$ref` as per the Swagger 2 and
  JSON Schema specifications.

## 0.22.6 (2018-12-07)

### Enhancements

- While generating a data structure from a Swagger Schema, we will now attempt
  to infer when the schema should be an object but the user has forgotten to
  put `type: object` by looking for the presence of `properties` in the schema.

- Adds support for object inheritance and mixins via `allOf` referencing in
  data structure generation.

  For example, the following will create an object which inherits from `User`:

  ```yaml
  allOf:
    - $ref: '#/definitions/User'
    - properties:
        id:
          type: string
  ```

  Secondly, when you reference multiple objects using `allOf` they will be
  treated as mixins:

  ```yaml
  allOf:
    - $ref: '#/definitions/BaseUser'
    - $ref: '#/definitions/UserMixin'
  ```

### Bug Fixes

- Fixes using `x-nullable` in a schema which previously caused the schema not
  to be converted to a data structure. For example, the following schema
  wouldn't result in a data structure:

  ```yaml
  type: string
  x-nullable: true
  ```

- Fixes some cases where rendering a JSON example from a Swagger Schema using
  example values which contain references would fail.

## 0.22.4 (2018-11-29)

### Bug Fixes

- Fixes a regression introduced in 0.22.3 which caused a reference (`$ref`)
  from a definition to another definitions example value to fail.

## 0.22.3 (2018-11-27)

### Bug Fixes

- Example values in nested Schema Object will now be used for JSON body
  generation.

## 0.22.2 (2018-10-25)

- Fixes a regression introduced in 0.22.0 where using `$ref` directly inside a
  Swagger Schema found within the `definitions` section would cause a parsing
  failure.

## 0.22.1 (2018-10-22)

### Bug Fixes

- Fixes a regression introduced in 0.22.0 where the parse result may contain
  invalid references inside a JSON Schema for example values if they used
  references. This regression also caused `$ref` to be incorrectly present in
  Data Structure sample values.

## 0.22.0 (2018-10-11)

### Enhancements

- Adds a dataStructures section to the parse result containing every data
  structure found within the definitions section of a Swagger document. We now
  use referencing between data structures found within a request or response
  data structure which generally makes parse results smaller instead of
  duplicating the data structure contents.

### Bug Fixes

- Adds support for primitive request bodies.

## 0.21.1 (2018-09-10)

### Bug Fixes

- No longer expand all option values (properties, array values) etc in the case
  that a schema has a circular reference.

## 0.21.0 (2018-09-07)

### Enhancements

- Line and column numbers are now exposed in the parse result in source maps
  for annotation elements.

### Bug Fixes

- Default and example values for headers are now validated to match the header
  type. For example, placing a string as a value for a number type header will
  now emit a warning.

- Header values will now contain source map information in the parse result.

- Fix support for type `file` in multipart-form body generation.

## 0.20.0 (2018-09-04)

### Enhancements

- The API Version is now exposed in the parse result. The API category now
  contains a version attribute including the API version.

- Circular references are now supported in schemas and JSON and JSON Schemas
  will now be present in parse results when you use circular references.

### Bug Fixes

- Example values in a Schema Object will now be placed into the dataStructure
  as a value instead of inside samples in cases where there isn't already a
  value.

## 0.19.2

### Bug Fixes

- Return an error in the parse result when the source API Description Document
  is not an object. Previously an error was thrown.

- When a request or response body has a schema of `format: binary` then we no
  longer generate a JSON Schema in the parse result. A JSON Schema for binary
  types doesn't make sense as you cannot place binary data in JSON.

- Example values found in schemas are now translated into examples in
  generated JSON Schema exposed in parse results.

- Data Structure sample values will now include schema example values.

- Request and Response body examples will now respect the example values of a
  schema.

## 0.19.1

### Enhancements

- When a schema uses `allOf` and doesn't provide a type hint at the schema
  root, the `allOf` types are matched for object schemas. This allows the
  following schema to work where before `type: object` was required at the
  schema root at the same level as `allOf`:

  ```yaml
  allOf:
    - type: object
      properties:
        username:
          type: string
    - type: object
      properties:
        name:
          type: string
  ```

### Bug Fixes

- When using `enum` in conjunction with `x-nullable` in a schema, this will now
  result in the `null` value being present in schema if it isn't already.

## 0.19.0

### Enhancements

- Enumeration behaviour is now the same as API Elements 1.0 such that the
  values that are fixed will now have a fixed type attribute.

## 0.18.4

### Enhancements

- Swagger `security-scheme` vendored extensions are now present in the parse
  result.

### Bug Fixes

- Supports detecting Swagger documents which are JSON formatted with spaces
  before the `:`. For example, the following document would not be matched to
  this adapter: `{ "swagger" : "2.0" }`.

- When a parameter has no valid enumerations defined in an `enum`, we will now
  discard the enumeration in the parse result. Previously the parser would create an
  empty enumeration element from completely invalid enumerations in a Swagger
  document which can cause issues further down in subsequent tooling and Minim
  serialisation.

## 0.18.3

### Bug Fixes

- Swagger Schemas are now recursively translated from Swagger schema into JSON
  Schema draft 4 in the resultant messageSchema of a parse result. This fixes
  bugs where components such as `x-nullable`, `readOnly`, `externalDocs` etc
  are not handled when found inside another schema as a sub-schema.

## 0.18.2

### Bug Fixes

- Fixes an issue where auth scheme elements are re-used multiple times in
  a parse result which can cause exceptions when the parse result is frozen.
  This is in the case where you have multiple consumes so multiple
  request/response pairs are created for the action.

## 0.18.1

### Enhancements

- Allow `date` and `date-time` format support.

## 0.18.0

### Breaking

- Support for Node 4 was removed. Node 6 is the minimum supported version of
  Node.

### Enhancements

- Adds support for the `x-nullable` schema extension. This allows adding `null`
  as a type to a schema. This is an OpenAPI 3 feature ported to Swagger 2 as a
  vendored extension.  
  [#112](https://github.com/apiaryio/fury-adapter-swagger/issues/112)

## 0.17.0

### Enhancements

- Optional object properties are now always present in generated JSON examples.

## 0.16.1

### Bug Fixes

- Allow parsing Swagger parameters of array type which do not have samples and
  offer `items` which does not include a type.
- Coerce a resource `x-summary` value to a string if it is not already a
  string. When a user enters an incorrect type such as boolean, number or
  array. The title would become an incorrect type and can cause subsequent
  tooling to fail.

## 0.16.0

### Enhancements

- Samples and Defaults of enum schema and parameters are now wrapped
  in enum element.

## 0.15.2

### Enhancements

- File type parameters are now included instead of being ignored.

## 0.15.1

### Bug Fixes

- Data Structure generation was not including required typeAttribute for
  required object properties.

## 0.15.0

### Enhancements

- Sample values are now generated for data structures of object and array types.
- Request/Response pairs are now generated from explicit examples, or the first
  JSON produces content-type.

## 0.14.3

### Bug Fixes

- Generated multipart form-data example requests were missing the end of the
  multi-part.
- `example` properties in Schema Object are not respected in data structure
  generation.


## 0.14.2

### Bug Fixes

- Prevent throwing or attaching additional warning while handling a source YAML
  document that produces an error while using the `generateSourceMap` flag.

  There was a race condition where the `done` callback can be called twice as
  we would call the callback with an error and `fury` would catch a raised
  error and then return that error. This would also cause a state when parsing
  an invalid YAML document would produce an error AND a warning in the returned
  parse result.

## 0.14.1

### Enhancements

- Request example bodies are now generated for formData parameters while using
  the `multipart/form-data` consumes content type.

## 0.14.0

### Bug Fixes

- Request and response pairs are now created for all combinations of produces,
  and consumes content types. This includes multiple JSON content types which
  we're previously discarded and non-JSON content types.
- `multipart/form-data` consumes type is no longer replaced by
  `application/x-www-form-urlencoded` when formData parameters are provided.
  [#96](https://github.com/apiaryio/fury-adapter-swagger/issues/96)

## 0.13.4

### Enhancements

- Added support for `externalDocs`.
- Parser will now give warning about unsupported collection formats in parameters.

## 0.13.3

### Bug Fixes

- Parameter default, example and enumerations values are now validated against
  the parameter type. Invalid values will emit warnings and be discarded, this
  resolves further problems when handling the invalid values.
- Data Structure generation will now support integer JSON Schema type.

## 0.13.2

### Bug Fixes

- HOST metadata was incorrectly included in an attribute called `meta`. The
  attribute was renamed to `metadata` in API Elements 1.0.
- Fixes an issue where auth scheme elements are re-used multiple times in
  a parse result which can cause exceptions when the parse result is frozen.

## 0.13.1

### Bug Fixes

- Handle array parameters which contain enumerations.

## 0.13.0

- Compatibility with [Minim 0.19](https://github.com/refractproject/minim/releases/tag/v0.19.0)
  and [Fury 3.0.0-beta.4](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.4).

### Enhancements
- Support `allOf` when generating data structures for objects

### Breaking
- Updated enum to match the new [format](https://github.com/apiaryio/api-elements/pull/28)

### Bug Fixes
- Add warning when x-example is not of error type when defined as array

## 0.12.1

### Enhancements

- Support `allOf` in object JSON Schemas when producing object data structure
  elements.

## 0.12.0

- Updates to fury 3.0.0-beta.3 which supports Refract 1.0 serialisation
  rules.

## 0.12.0-beta.3

- Updates to fury 3.0.0-beta.2.

### Bug Fixes

- Adds support for `csv` and `multi` parameter collectionFormat for query
  parameters.

- Parameters which define both an example (`x-example`) and `items` schema will
  now use the `x-example` value as the example.

- URI Template variables are now correctly escaped.

## 0.12.0-beta.2

### Bug Fixes

- Data Structure generation from JSON Schema handles array items which
  contain empty values.

## 0.12.0-beta.1

### Enhancements

- Data Structure elements are now generated from JSON Schema found in examples.

## 0.11.1 (2017-04-25)

### Bug Fixes

- Updated yaml-js dependency to 0.1.5. This resolves problems with determining
  source maps for Swagger documents that include multi-byte unicode characters
  such as emoji.

## 0.11.0 (2017-04-11)

- Update fury to 3.0.0-beta.0
- Update minim to 0.15.0
- Update minim-parse-result to 0.4.0

## 0.10.0 (2017-03-30)

- Upgraded babel-runtime dependency to v6
- Drop support for node 0.12 and 0.10

## 0.9.13 (2017-02-07)

### Bug Fixes

- Handle inheritance for Path level Parameters

## 0.9.12 (2016-12-13)

### Bug Fixes

- Improve handling of default in parameters.

- Prevent a crash on invalid media types, such as `application/json;
  invalid-component` and produce warnings for invalid media types.

## 0.9.11 (2016-11-25)

### Bug Fixes

- Fixes crashes on bad media types.

## 0.9.10 (2016-11-24)

### Bug Fixes

- Circular references in examples will now give a warning about not  being supported yet.

## 0.9.9 (2016-11-15)

### Bug Fixes

- Generates JSON examples for JSON subtypes such as `application/hal+json`.

- Fixes a crash during sourcemap construction for some specific documents

## 0.9.8 (2016-10-31)

### Bug Fixes

- Prevents constructing large arrays and strings when generating a request or
  response body from a JSON Schema where there is a large
  `minItems`, `maxItems`, `minLength` or `maxLength`.

## 0.9.7 (2016-10-25)

### Bug Fixes

- Prevents dereferencing external assets such as local files.

## 0.9.5 (2016-09-01)

### Bug Fixes

- Improves error reporting in some cases when references are involved.

- Improves error reporting when the YAML document contains YAML syntax errors
  to include source maps and the YAML error.

## 0.9.4 (2016-08-30)

## 0.9.3 (2016-08-30)

### Bug Fixes

- Added support to exclude extensions from operations

## 0.9.2 (2016-08-26)

### Enhancements

- Upgraded lodash dependency from 3.x.x to 4.x.x

## 0.9.1 (2016-07-27)

### Enhancements

- Added support for adding example values to parameters using `x-example`

## 0.9.0 (2016-07-27)

### Enhancements

- Added support for parameter property called x-example, which allows to specify
  example values also for non-body parameters.

## 0.8.1 (2016-07-16)

### Enhancements

- The adapter is more asynchronous and thus, gives other events in the event
  loop the ability to run while we're parsing the Swagger document.

## 0.8.0 (2016-07-01)

### Enhancements

- Added authentication support.
- Swagger vendor extensions are now exposes as API Element extensions.
- Response and Request bodies are generated from Schema whenever applicable.
- Accept and Content-type headers are generated based on produces and consumes keys whenever applicable.
- Sample values for non-body parameters are generated whenever applicable.
- Header parameters are appended to request/response header collection.
- Added `formData` support and appropirate request body generation.

### Bug Fixes

- Fixed metadata not being an array of Member Elements.
- Added source maps to resource.href, httpRequest.method, httpResponse.statusCode.
- Removed several unneeded source maps.
- Circular schema references will now give a warning about not being supported yet.
- Added fragment to uncaught error.
- Fixed bug with parameters sourcemaps when they are mixture of body and query parameters.

## 0.7.3 (2016-04-12)

- All exceptions thrown when converting swagger to refract will now be caught and returned as a proper error in parse result

## 0.7.2 (2016-02-18)

- Add an example for testing the module in the browser via TonicDev.

## 0.7.1 (2016-02-15)

- Swagger's `operationId` is now correctly interpreted as transition element's `id` instead of `relation`.

## 0.7.0 (2016-02-02)

- Swagger documents that do not validate against the JSON Schema for Swagger
  will no longer be translated into Refract and instead expose errors for the
  validation failures.

## 0.6.2 (2016-01-13)

- Bad JSON references (using `$ref`) are now returned as parse result
  annotations that include source maps which point to the `$ref` line, making
  debugging easier.

## 0.6.1 (2016-01-11)

- Fix handling of resource `href`, which could get overwritten while processing transitions and result in missing parameters in the URI template.
- Code refactoring

  - Parsing is now handled by a class to more easily share state between various methods. This lays the framework for more refactoring and code cleanup.
  - The parser shared state tracks the path of the component currently being parsed, which makes it easier to split pieces of the parser into separate methods.
  - YAML AST lookup paths are now arrays of strings rather than strings of period-separated components, which made escaping very difficult.
  - Rather than guessing the YAML type, the AST lookup now checks and handles it accordingly. Paths like `'foo.bar.0.baz'` would fail previously and now work (but are passed as `['foo', 'bar', '0', 'baz']`).
  - Underscore is now replaced with Lodash for consistency with other modules.

## 0.6.0 (2015-12-14)

  - Invalid YAML now returns error

## 0.5.3 (2015-12-11)

- Add source maps for YAML parse error annotations, which were previously missing.

## 0.5.2 (2015-12-10)

- Add support for `formData` parameters, which get converted into request data structures.
- Add source maps for `messageBodySchema` assets.

## 0.5.1 (2015-12-10)

- Do not encode JSON strings twice
- Support `x-summary` and `x-description` in Path Item Objects

## 0.5.0 (2015-12-08)

- Generate Swagger schema and spec validation annotations.
- Implement support for link relations in parser annotations.
- Encode dashes (`-`) in URI template parameters.

## 0.4.0 (2015-12-02)

- Implement support for parser annotations.

## 0.3.2 (2015-11-30)

- Implement support for source maps.

## 0.3.1 (2015-11-25)

- Fixes bug where URI templates appended empty query section.
- Fixes additional slashes in URLs when basePath ends with `/`.

## 0.3.0 (2015-11-18)

- Handle Swagger extensions (`x-*` fields).
- Support tags as resource groups when possible.
- Support hostname and basepath.
- Support request parameters when no response is given.
- Better support for HTTP headers.
- Add module for building URI templates from path and operation parameters.

## 0.2.0 (2015-11-17)

- Allow input to be either a loaded object or JSON/YAML string.
- Better JSON Schema reference handling via `json-schema-ref-parser` package.
- Do not set resource titles.
- Use `summary` instead of `operationId` for action titles.
- Set a relation value based on `operationId` for actions.

## 0.1.0 (2015-09-22)

- Initial release.
