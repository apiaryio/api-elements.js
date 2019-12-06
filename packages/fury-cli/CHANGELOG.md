# Changelog

## 0.9.2 (2019-12-06)

### Enhancements

- Any adapter added via the `--adapter` option will be preferred for parsing
  when there are multiple adapters loaded for the same media types. For example
  if you want to use `--adapter fury-adapter-remote` and there is already a
  conflicting adapter such as `fury-adapter-apib-parser` which previously took
  precedence.

## 0.9.1 (2019-07-02)

This update incorporates changes from Fury Adapters:

- fury-adapter-oas3-parser 0.8.0

## 0.9.0 (2019-06-11)

### Breaking

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is
  recommended.

## 0.8.12 (2019-03-26)

This update incorporates changes from Fury Adapters:

- fury-adapter-oas3-parser 0.7.0

## 0.8.11 (2019-03-05)

This update incorporates changes from Fury Adapters:

- fury-adapter-swagger 0.24.1
- fury-adapter-apib-serializer 0.9.1

## 0.8.10 (2019-02-26)

This update uses [Fury 3.0.0 Beta
9](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.9)
toolchain.

## 0.8.9 (2019-01-30)

### Enhancements

- This update now uses fury-adapter-oas3-parser 0.5.0. Please see
  [fury-adapter-oas3-parser 0.5.0](https://github.com/apiaryio/api-elements.js/blob/master/packages/fury-adapter-oas3-parser/CHANGELOG.md)
  for the list of changes.

## 0.8.8 (2019-01-25)

### Enhancements

- This update now uses fury-adapter-oas3-parser 0.4.0. Please see
  [fury-adapter-oas3-parser 0.4.0](https://github.com/apiaryio/api-elements.js/blob/db9bdb65d403832aa6d02d7f2f3babe7ad3bbd1a/packages/fury-adapter-oas3-parser/CHANGELOG.md)
  for the list of changes.

## 0.8.7 (2019-01-18)

### Enhancements

- OpenAPI 3 is now supported.

## 0.8.6

### Breaking

- Node 4 is not supported anymore.

### Enhancements

- `--version` will now return the version of the underlying Fury adapters.

## 0.8.5 (2018-11-27)

### Enhancements

- This update now uses fury-adapter-swagger 0.22.3. Please see
  [fury-adapter-swagger 0.22.3](https://github.com/apiaryio/fury-adapter-swagger/releases/tag/v0.22.3)
  for the list of changes.

## 0.8.4 (2018-10-16)

### Enhancements

- This update now uses fury-adapter-swagger 0.22.0. Please see
  [fury-adapter-swagger 0.22.0](https://github.com/apiaryio/fury-adapter-swagger/releases/tag/v0.22.0)
  for the list of changes.

## 0.8.3 (2018-09-07)

### Enhancements

- This update now uses fury-adapter-swagger 0.21.0. Please see
  [fury-adapter-swagger 0.21.0](https://github.com/apiaryio/fury-adapter-swagger/releases/tag/v0.21.0)
  for the list of changes.

## 0.8.2 (2018-09-07)

### Enhancements

- This update now uses fury-adapter-swagger 0.20.0. Please see
  [fury-adapter-swagger 0.20.0](https://github.com/apiaryio/fury-adapter-swagger/releases/tag/v0.20.0)
  for the list of changes.

## 0.8.1

### Bug Fixes

- Fixes an exception being raised when trying to pass API Elements document to
  Fury CLI as source.

## 0.8.0

### Enhancements

- Command line allows you to pass in an API Elements document as source.
- Annotations are now printed with the source line number.

## 0.7.0

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 7](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.7).

## 0.6.0

### Enhancements

- Added a `--shell` option, this allows you to launch a interactive repl where
  you can interact with the parse result.

## 0.5.2

### Enhancements

- Updated Fury and other parser dependencies.

## 0.5.1

### Enhancements

- Added `application/vnd.refract.parse-result+json; version=1.0`
  and `application/vnd.refract.parse-result+yaml; version=1.0`
  formats.

## 0.5.0

### Enhancements

- Using validate will not output a minimized parse result

## 0.4.0

### Enhancements

- The output format `application/vnd.refract.parse-result+json; version=0.6`
  and `application/vnd.refract.parse-result+yaml; version=0.6` were added which
  allows you to serialise to the Refract 0.6 JSON/YAML Serialisation format.

### Bug Fixes

- Prevent fury-cli from erroring when handling annotations that do not contain
  a code.

## 0.3.0 (2017-06-11)

- Update to Fury 3.0.0-beta.3 which updates Refract JSON serialisation rules to
  1.0.0.

## 0.2.0 (2017-04-04)

- Upgrade babel-runtime dependency to v6
- Drop support for node 0.12 and 0.10

## 0.1.0

- Initial Library
