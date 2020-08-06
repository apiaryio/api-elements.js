# API Elements: API Blueprint Parser Changelog

## 0.20.1 (2020-08-05)

Adds compatibility for @apielements/core 0.2.0.

### Enhancements

- The parser can now be configured to disable generation of example message
  bodies and message body schemas by providing the adapter options
  `generateMessageBody` and/or `generateMessageBodySchema` as `false` during
  parse.

## 0.20.0 (2020-06-12)

The package has been updated for compatibility with `@apielements/core`.

## 0.19.0 (2020-04-29)

The package has been renamed to `@apielements/apib-parser`.

## 0.18.1 (2020-04-28)

Internal changes to the dependency tree to simplify package maintenance.

## 0.18.0 (2020-04-20)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 14](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.14).

## 0.17.0 (2019-12-06)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 13](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.13).

## 0.16.0 (2019-07-02)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 12](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.12).

## 0.15.0 (2019-06-11)

### Breaking

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is
  recommended.

## 0.14.0 (2019-03-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 10](https://github.com/apiaryio/api-elements.js/releases/tag/fury@3.0.0-beta.10).

## 0.13.0 (2019-02-26)

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 9](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.9).

## 0.13.0-beta (2019-01-10)

This update now uses drafter-npm 2.0.0-pre.1. Please see [drafter-npm
2.0.0-pre.1](https://github.com/apiaryio/drafter/releases/tag/v2.0.0-pre.1) for
the list of changes.

## 0.12.0 (2018-12-21)

### Breaking

- Node 4 is not supported anymore.
- API Blueprint Parser now requires [Fury 3.0.0 Beta 8](https://github.com/apiaryio/api-elements.js/releases/tag/fury-3.0.0-beta.8).

### Enhancements

- Update minim to 0.22.1.

## 0.11.0

### Enhancements

- Compatibility with [Fury 3.0.0 Beta 7](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.7).

## 0.10.0

### Enhancements

- Compatibility with [Minim 0.20.1](https://github.com/refractproject/minim/releases/tag/v0.20.1)
  and [Fury 3.0.0 Beta 6](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.6).

## 0.9.0

- Compatibility with [Minim 0.19](https://github.com/refractproject/minim/releases/tag/v0.19.0)
  and [Fury 3.0.0-beta.4](https://github.com/apiaryio/fury.js/releases/tag/v3.0.0-beta.4).

## 0.8.0

- Compatibility with minim 0.18 and Fury 3.0.0-beta.3.

## 0.7.0 (2017-03-30)

- Upgraded babel-runtime dependency to v6
- Drop support for node 0.12 and 0.10

## 0.6.1 (2017-01-03)

## 0.6.0 (2016-11-16)

### Enhancements

- Adds support for `markdown` suffix in apiblueprint content type;

## 0.5.0 (2016-10-31)

### Enhancements

- Adds support for API Blueprint validation.

## 0.4.0 (2016-10-27)

### Enhancements

- Adds support for the `requireBlueprintName` option during parsing. This
  option will validate that the blueprint has a name.

## 0.3.0 (2016-07-19)

### Enhancements

- Switches to use [drafter-npm](https://github.com/apiaryio/drafter-npm)
  package for API Blueprint parsing.

## 0.2.1 (2016-04-29)

- Upgrade [Protagonist][] to 1.x.x

## 0.2.0 (2015-09-14)

- Update to [Protagonist][] 1.0.0
- Build system updates

## 0.1.0 (2015-09-10)

- Initial release.

[Protagonist]: https://github.com/apiaryio/protagonist
