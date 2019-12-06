# Changelog

## 3.0.0-beta.10 (2019-12-06)

### Bug Fixes

- Prevents placing a null title element in a resource group when the section
  name is empty.

## 3.0.0-beta.9 (2019-07-02)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 12](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.12).

## 3.0.0-beta.8 (2019-06-11)

### Breaking

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is
  recommended.

## 3.0.0-beta.7 (2019-03-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 10](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.10).

## 3.0.0-beta.6 (2019-02-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 9](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.9).

## 3.0.0-beta.5 (2018-12-21)

### Breaking

- Node 4 is not supported anymore.
- Apiary Blueprint Parser now requires [Fury 3.0.0 Beta 8](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.8).

## 3.0.0-beta.4

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 7](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.7).

### Bug Fixes

- Parser will no longer create place a `null` element as the HTTP headers when
  there are no HTTP headers.

## 3.0.0-beta.3

### Enhancements

- Compatibility with [Minim 0.20.1](https://github.com/refractproject/minim/releases/tag/v0.20.1)
  and [Fury 3.0.0 Beta 6](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.6).

## 3.0.0-beta.2

### Enhancements

- Support [Fury 3.0.0-beta.4](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.4).

## 3.0.0-beta.1

### Enhancements

- Support fury 3.0.0-beta.3.

## 2.0.0 (2017-03-30)

- Upgrade babel-runtime dependency to v6
- Drop support for node 0.12 and 0.10

## 1.1.3

### Bug Fixes

* Fixes a bug where having HOST metadata with a path would cause JSON Schema
  Validations to not be converted to the API Elements result.


## 1.1.2

### Bug Fixes

* Fixes a bug where the leading slash on a path may be stripped if there is a
  leading slash on a path in the HOST metadata.


## 1.1.1

### Bug Fixes

* Fixes a bug where a path included in the HOST metadata may be duplicated in
  each href.


## 1.1.0

### Enhancements

* Adds support for JSON Validators.

### Bug Fixes

* Provides source map information on error annotations where possible.


## 1.0.0

Initial Library
