# Fury OAS3 Parser Changelog

## Master

### Bug Fixes

- Unsupported properties in 'Parameter Object' will now emit an unsupported
  warning, previously using unsupported properties was emitting a warning that
  the properties were invalid.

## 0.4.0 (25-01-19)

### Enhancements

- 'Request Body Object' are now supported, request body description and
  examples will be shown in the parse result.

### Bug Fixes

- The parser will warn when an OAS 3 document contains operation's with the
  same `operationId`.
