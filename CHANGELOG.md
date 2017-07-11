# Changelog

## Master

### Enhancements

- Support fury 3.0.0-beta.3.

# 2.0.0 - 2017-03-30

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
