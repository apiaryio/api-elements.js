# Fury API Blueprint Serializer

## 0.12.1 (2019-07-12)

### Bug Fixes

- Prevent double new lines being appended to the end of serialized API
  Blueprints.

## 0.12.0 (2019-07-02)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 12](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.12).

## 0.11.0 (2019-06-11)

### Breaking

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is
  recommended.

## 0.10.0 (2019-03-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 10](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.10).

## 0.9.1 (2019-03-05)

### Bug Fixes

- Fixes an issue where the serialiser would raise an exception when dealing
  with message body payloads which do not contain headers.

## 0.9.0 (2019-02-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 9](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.9).

## 0.8.0 (2018-12-21)

### Breaking

- Node 4 is not supported anymore.
- API Blueprint Serializer now requires [Fury 3.0.0 Beta 8](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.8).

## 0.7.0

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 7](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.7).

## 0.6.0

### Enhancements

- Compatibility with [Minim 0.20.1](https://github.com/refractproject/minim/releases/tag/v0.20.1)
  and [Fury 3.0.0 Beta 6](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.6).

## 0.5.0 (2017-08-09)

- Compatibility with [Minim 0.19](https://github.com/refractproject/minim/releases/tag/v0.19.0)
  and [Fury 3.0.0 Beta 4](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.4).

## 0.4.1 (2017-08-02)

### Bug Fixes

- Adds support for Data Structures produced from the Fury Swagger Adapter.

## 0.4.0 (2017-06-11)

### Enhancements

- Adds support for Fury 3.0.0-beta.3.

## 0.3.1 (2017-05-12)

- Adds support for Fury@3 and includes multiple fixes

## 0.3.0 (2017-03-30)

- Upgrade babel-runtime dependency to v6
- Drop support for node 0.12 and 0.10

## 0.2.0 (2017-01-24)

### Enhancements

- Adds support for Fury ~> 2.3.

### Bug Fixes

- Fixes handling of parameter descriptions.
- Fixes handling of MSON data structures and MSON attributes.

## 0.1.2 (2015-09-21)

- Fix handling of request/responses with empty bodies but including a description. These must make use of an empty body via `+ Body` or the description is considered the body content.

## 0.1.1 (2015-09-15)

- Fix packaging issue that prevented the template from shipping with the published npm package.
- Fix display of request/response description.
- Fix old reference to `transition.parameters` which is now called `hrefVariables`.

## 0.1.0 (2015-09-10)

- Initial release.
