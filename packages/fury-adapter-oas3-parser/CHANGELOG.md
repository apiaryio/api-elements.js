# Fury OAS3 Parser Changelog

## Master

### Enhancements

- Added support for the `nullable`, `description`, `default` and `example`
  Schema Object properties.

### Bug Fixes

- Removed `null` as a valid type for a Schema Object, `null` is not supported
  as a type in OpenAPI 3 Schema Object. `nullable` should be used instead.

## 0.5.1 (30-01-19)

### Bug Fixes

- Fixes support for schema objects which do not declare a type.

## 0.5.0 (30-01-19)

### Enhancements

- Object properties in a Schema Object are now supported.
- Referencing (`$ref`) a response object is now supported.
- Array items in a Schema Object are now supported.
- Object required properties in a Schema Object are now supported.
- Request bodies and request body references are now supported in operations.

### Bug Fixes

- Fixed detection of YAML OpenAPI 3 documents where the OpenAPI version was not
  wrapped in quotes.

## 0.4.1 (28-01-19)

### Enhancements

- Path and query parameters are not supported in 'Operation Object'

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

## 0.4.0 (25-01-19)

### Enhancements

- 'Request Body Object' are now supported, request body description and
  examples will be shown in the parse result.

### Bug Fixes

- The parser will warn when an OAS 3 document contains operation's with the
  same `operationId`.
