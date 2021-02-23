# API Elements: OpenAPI 3 Parser Changelog

## 0.16.0 (2021-02-23)

### Enhancements

- Support for OpenAPI 3.1, some features and fields are not supported (these
  will emit the appropriate unsupported warnings).

  This includes support for `const` and array `type` in 'Schema Object'.

- Support for the 'title', 'description', and 'enum' properties in 'Schema
  Object's found within 'Parameter Object'.

## 0.15.2 (2021-02-15)

### Enhancements

- Minimal support for 'Parameter Object' schemas, simple schemas using 'type'
  and 'example' are supported.

## 0.15.1 (2020-11-10)

### Bug Fixes

- Return a parsing warning when Paths Object contains keys which are not
  strings. Previously the parser would throw an error.

## 0.15.0 (2020-08-06)

### Enhancements

- The parser will only emit warnings for unsupported features a single time.
  This can dramatically increase the performance when dealing with documents
  which use many unsupported features.

### Bug Fixes

- Return a warning when parsing a document with a 'Media Type Object'
  using a text based media type when the example value is not a string.
  Previously an invalid asset element was created which contained non-string
  content.

- Moves the description from 'Server Object' variable values into the member
  element which contain it for consistency.

- Fixes a case where source map information for the description of a 'Server
  Object' variable would be missing.

- Prevent the generation of message body examples for text-based media types
  when the value is not string based. A warning will now be emitted under this
  circumstance.

## 0.14.2 (2020-07-20)

### Bug Fixes

- Prevents the parser from throwing an unhandled error while parsing components
  which use keys which are the same as an [API Element type
  identifier](https://apielements.org/en/latest/element-definitions.html). The
  parser will now produce a handled error mentioning that these keys are
  reserved and currently unsupported in the parser.

## 0.14.1 (2020-07-01)

### Enhancements

- Adds support for the Schema Object title property.

### Bug Fixes

- Adds an accept header to requests with the matching responses content type.

## 0.14.0 (2020-06-24)

### Enhancements

- Adds partial support for using `oneOf` in a Schema Object. One of is
  supported when used in a schema object alone, or with the nullable constraint
  or any annotation.  It is not supported in the case when one of is used in
  conjunction with other constraints in the same schema object.

### Bug Fixes

- Supports using `$ref` in the root of a component, for example:

    ```yaml
    components:
      schemas:
        UserAlias:
          $ref: '#/components/schemas/User'
        User:
          type: object
    ```

- Prevents the parser from throwing an error upon encountering an unknown or
  invalid YAML node tag, such as `!!unknown`.

## 0.13.1 (2020-06-22)

### Bug Fixes

- Prior versions of the adapter reported the following 'Header Object' keys as
  invalid: `style`, `explode`, `allowReserved`, `schema`, `content`, `example`,
  and `examples`. These will now return an unsupported warning instead.

- Negative boolean YAML values was previously treated as true and thus
  Parameter Object's with `required: false` would have been incorrectly treated
  as required.

## 0.13.0 (2020-06-12)

The package has been updated for compatibility with `@apielements/core`.

## 0.12.3 (2020-06-10)

### Bug Fixes

- Prevent 'Server Object' variables from being incorrectly wrapped in an object
  element.

- Fix `generateMessageBody` option, the option had no affect in prior releases.

## 0.12.2 (2020-05-12)

### Bug Fixes

- Support required keys in a Schema Object which are not found in the
  properties list.

## 0.12.1 (2020-04-30)

### Bug Fixes

- Prevent the parser from throwing an error when handling a Server Object with
  variables when the URL does not contain any variables. For example:

  ```yaml
  openapi: 3.0.3
  servers:
    - url: https://example.com
      variables:
        version:
          default: '1.0'
  paths: {}
  ```

## 0.12.0 (2020-04-29)

The package has been renamed to `@apielements/openapi3-parser`.

## 0.11.1 (2020-04-28)

### Enhancements

- Support for `servers` in `Path Item Object` and `Operation Object`

- 'Parameter Object' 'explode' style is partially supported, it can be used
  with query parameters.

## 0.11.0 (2020-04-20)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 14](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.14).

- Support for "default" response status codes.

- Support for `Server Object` and `Server Variable Object`

- The parser can now be configured to disable generation of example message
  bodies by providing an adapter option `generateMessageBody` as `false` during
  parse.

## 0.10.2 (2020-03-16)

### Enhancements

- Adds support for `termsOfService` in 'Info Object'.

- Adds support for `contact` in 'Info Object'.

### Bug Fixes

- Prevents an exception being raised when using `freeze()` on the parse result
  returned by the parser when the OpenAPI document uses a request header with
  multiple request/response pairs.

## 0.10.1 (2020-01-30)

### Bug Fixes

- Prevents the parser from throwing an error when encountering an unsupported
  scheme in a http Security Scheme Object.

## 0.10.0 (2019-12-06)

### Enhancements

- Added support for `info.license` (License Object).

## 0.9.1 (2019-08-08)

### Enhancements

- Adds support for example values for text based media types such as
  `text/*` and `application/xml`.

### Bug Fixes

- Prevents the parser from throwing an exception when encountering an invalid
  media type.

## 0.9.0 (2019-07-02)

This release brings significant performance improvement to parsing large
OpenAPI 3.0 documents.

## 0.8.1 (2019-06-12)

### Bug Fixes

- Fixed handling of OpenAPI 3 documents which included invalid 'Schema Object'
  in reusable components. Under some circumstances these could cause the parser
  to throw an exception.

## 0.8.0 (2019-06-11)

### Breaking

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is
  recommended.

### Enhancements

- Support parameters in media types, for example `application/json; charset=UTF-8`.

## 0.7.7 (2019-05-31)

fury-adapter-oas3-parser 0.7.7 is a re-release of 0.7.5 due to a packaging
error with 0.7.5 which caused the package to be unpublished.

## 0.7.6 (2019-05-31)

fury-adapter-oas3-parser 0.7.6 is a re-release of 0.7.5 due to a packaging
error with 0.7.5 which caused the package to be unpublished.

## 0.7.5 (2019-05-23)

### Bug Fixes

- Prevents an exception being raised when using `freeze()` on the parse result
  returned by the parser when you reference a parameter component multiple
  times in an OpenAPI Document.

## 0.7.4 (2019-04-12)

### Enhancements

- 'Parameter object' 'name' is now validated according to location ('in'
  parameter).

## 0.7.3 (2019-04-05)

### Bug Fixes

- Fixes a bug where parsing an OpenAPI 3.1.0 or higher document will result in
  an parse result containing only a warning and missing the API Category.

- Fixes the parser from throwing an error while handling invalid or unsupported
  security scheme components.

- Added additional information to YAML parsing errors where available to make
  the errors more understandable.

- Fix referencing a headers component. Previously this would return an error
  that the headers components was undefined.

## 0.7.2 (2019-04-01)

### Bug Fixes

- Added validation of media types, previously we would throw an error while
  handling invalid media types.

## 0.7.0 (2019-03-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 10](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.10).

- Added primitive support for 'examples' in 'Media Type Object'. The first
  example value is used for JSON media types.

- Added support for generating a JSON message body from a schema for
  JSON media types.

- Added support for header parameters.

- Instances of referenced data structures will now be instances of the
  referenced type.

  For example, given a schema named 'username' contains `type: string`.
  When another data structure references the 'username' schema, it's instance
  will be a `StringElement`.

### Bug Fixes

- Prevents an exception being raised due to improper handling of invalid
  schemas found in the reusable components section of an OpenAPI 3 document.

## 0.6.0 (2019-02-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 9](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.9).

### Bug Fixes

- Fix handling of empty `!!set` and `!!map` in YAML parsing.

## 0.5.2 (2019-02-19)

### Enhancements

- Added support for the `nullable`, `description`, `default` and `example`
  Schema Object properties.
- Added support for response headers.
- Added partial support for the `example` in Parameter Object
- A warning will now be emitted when an invalid 'Parameter Object' 'in' value
  is set, previously this would cause an error.

### Bug Fixes

- Removed `null` as a valid type for a Schema Object, `null` is not supported
  as a type in OpenAPI 3 Schema Object. `nullable` should be used instead.
- Added check for `required` in a Path Parameter.
- The parser will now handle Responses Object which contains status codes that
  are not strings. Previously the parser would throw an error, we will now
  coerce number status codes to a string and emit a warning when a status code
  is not a string.

## 0.5.1 (2019-01-30)

### Bug Fixes

- Fixes support for schema objects which do not declare a type.

## 0.5.0 (2019-01-30)

### Enhancements

- Object properties in a Schema Object are now supported.
- Referencing (`$ref`) a response object is now supported.
- Array items in a Schema Object are now supported.
- Object required properties in a Schema Object are now supported.
- Request bodies and request body references are now supported in operations.

### Bug Fixes

- Fixed detection of YAML OpenAPI 3 documents where the OpenAPI version was not
  wrapped in quotes.

## 0.4.1 (2019-01-28)

### Enhancements

- Path and query parameters are supported in 'Operation Object'

### Bug Fixes

- Unsupported properties in 'Parameter Object' will now emit an unsupported
  warning, previously using unsupported properties was emitting a warning that
  the properties were invalid.

- The parser will no longer error out for unsupported parameter 'in' values,
  instead an unsupported warning will be emitted.

- Parameter names containing unreserved URI Template characters (`-`, `.`, `_`,
  and `~`) are now supported.

- Referencing (`$ref`) a parameter that couldn't be parsed (due to the
  parameter failing validation) will no longer cause a cryptic error that the
  referenced object was not defined.

## 0.4.0 (2019-01-25)

### Enhancements

- 'Request Body Object' are now supported, request body description and
  examples will be shown in the parse result.

### Bug Fixes

- The parser will warn when an OAS 3 document contains operation's with the
  same `operationId`.
