# Changelog

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

## 0.3.0 - 2017-06-11

- Update to Fury 3.0.0-beta.3 which updates Refract JSON serialisation rules to
  1.0.0.

# 0.2.0 - 2017-04-04

- Upgrade babel-runtime dependency to v6
- Drop support for node 0.12 and 0.10

## 0.1.0

Initial Library
