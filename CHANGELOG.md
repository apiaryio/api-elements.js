# Changelog

## Master

### Enhancements

This update now uses fury-adapter-swagger 0.21.0. Please see
[fury-adapter-swagger 0.21.0](https://github.com/apiaryio/fury-adapter-swagger/releases/tag/v0.21.0)
for the list of changes.

## 0.8.2 (2018-09-07)

### Enhancements

This update now uses fury-adapter-swagger 0.20.0. Please see
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

Initial Library
