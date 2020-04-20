# Fury Changelog

## 3.0.0-beta.14 (2020-04-20)

This release contains an updated api-elements models. See [api-elements
0.2.4](https://github.com/apiaryio/api-elements.js/releases/tag/api-elements%400.2.4)
for further details.

## 3.0.0-beta.13 (2019-12-06)

This release contains internal changes needed for included Fury adapters.

## 3.0.0-beta.12 (2019-07-02)

This release contains internal changes needed to improve the performance for
parsing OpenAPI 3.0 documents.

## 3.0.0-beta.11 (2019-06-11)

### Breaking

- The interface between Fury and adapters now uses promises. Any adapters need
  to be updated to use a promise interface.

- The `minim` option passed down to adapters has been renamed to `namespace`.
  The underlying value is a namespace from minim.

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is

### Enhancements

- Fury can now be used with promises or async/await. For example:

  ```js
  const parseResult = await fury.parse({ source: '# Hello World' });
  ```

## 3.0.0-beta.10 (2019-03-26)

### Breaking

- Fury will no longer catch exceptions thrown by an adapter during a
  `parse`, or `serialize`.  
  [#158](https://github.com/apiaryio/api-elements.js/issues/158)

### Enhancement

- Fury now pass into operations parse(), validate(), serialize() mediaType as one of adapter options
- Fury now allows distinguish among Media Types for individual oprations (for more info see README)

## 3.0.0-beta.9 (2019-02-26)

### Breaking

- Fury asynchronous APIs will no longer include both an error and a result
  value. The APIs will now contain an error if the method could not proceed, or
  a result. In the case of the `validate` and `parse` functions, these will
  return a parse result with any error annotations upon a validation error and
  will no longer include an error in the asynchronous callback.

### Enhancements

- Update minim to [0.23.0](https://github.com/refractproject/minim/releases/tag/v0.23.0).

## 3.0.0-beta.8 (2018-12-21)

### Breaking

- Node 4 is not support anymore.

### Enhancements

- Update minim to [0.22.1](https://github.com/refractproject/minim/releases/tag/v0.22.1).

## 3.0.0-beta.7

- Update minim to 0.20.5.

## 3.0.0-beta.6

- Update minim to 0.20.1.
- Update minim-parse-result to 0.10.0.

## 3.0.0-beta.5

- Added browser build distribution

## 3.0.0-beta.4

### Breaking

Fury was updated to use [Minim
0.19](https://github.com/refractproject/minim/releases/tag/v0.19.0).

## 3.0.0-beta.3

### Enhancements

- Fury contains a `detect` method which takes an API Description source and
  returns the registered adapters which can handle the API Description
  source.
- Updates to minim 0.18.0 which updates API Element and Refract serialisation.

## 3.0.0-beta.2 (2017-06-29)

- Update minim to 0.17.1
- Update minim-parse-result to 0.6.1

## 3.0.0-beta.1 (2017-05-12)

- Update minim to 0.16.0
- Update minim-parse-result to 0.5.0

## 3.0.0-beta.0 (2017-04-10)

- Upgrade babel-runtime dependency to v6
- Drop support for node 0.10 and 0.12
- Upgraded minim to 0.15.0
- Upgraded minim-parse-result to 0.4.0

## 2.3.0 (2016-10-24)

### Enhancements

- Fury will now allow you to `validate` an API Description.

## 2.2.0 (2016-09-01)

### Enhancements

- Fury will now allow you to pass down parser options down to the underlying
  parse adapter using the `adapterOptions` parameter.

## 2.1.0 (2016-05-24)

- Elements returned from parse will always be an instance of minim elements

## 2.0.0 (2016-04-28)

- Upgrade Minim to 0.14.0 and thus remove the short hand notation in fury
- Upgrade Minim Parse Result to 0.2.2

## 1.0.3 (2015-12-03)

- Dependency update to support require support for the `links` element.
- When a parser returns an error it is sometimes useful to inspect the parse result. This now gets passed back to the handler function and can be used to print more information, such as parser annotations, when an error occurs.

## 1.0.2 (2015-11-30)

- Upgrade Minim Parse Result to 0.2.1

## 1.0.1 (2015-11-30)

- Upgrade Minim to 0.12.3

## 1.0.0 (2015-11-17)

- Remove legacy interface. The only available interface is now the Refract interface. In order to use it, you must load adapter modules to handle particular formats.

## 0.8.4 (2015-07-30)

This release updates the underlying Minim library for working with Refract elements and fixes a bug.

- Refract: Update to [Minim 0.9.0](https://github.com/refractproject/minim/blob/master/CHANGELOG.md#090---2015-07-28)
- Legacy AST: Fix a bug related to the action's URI template not having precedence over the resource URI. [#40](https://github.com/apiaryio/fury.js/pull/40)

## 0.8.3 (2015-07-02)

This release brings couple fixes to how Swagger Adapter and API Blueprint Adapter operate.

- Swagger: Add support for arrays in query parameters
- Swagger: Handle transitions with no responses
- API Blueprint: Handle transitions with no requests and responses

## 0.8.2 (2015-06-26)

This release brings couple fixes to how Swagger Adapter and API Blueprint Adapter operate.

- Swagger: Handle response schemas in Swagger 2.0
- Swagger: Ignore default responses
- Swagger: Handle description of transitions
- API Blueprint: Reduce new lines in rendered output.

---

*Drafter.js [v0.2.5](https://github.com/apiaryio/drafter.js/releases/tag/v0.2.5)*

## 0.8.1 (2015-06-19)

- Better parameter support for Swagger parser. ((#26)[https://github.com/apiaryio/fury.js/issues/26])
- Dereferncing of local references in JSON Schemas ((#27)[https://github.com/apiaryio/fury.js/issues/27])

## 0.8.0 (2015-06-16)

- Expose a new [Refract][]-based interface through `fury.parse`, `fury.load`,
  and `fury.serialize`. This is a *work in progress*.
- Add a Swagger parser.
- Add an API Blueprint serializer with basic MSON support.
- Update the codebase to make use of ES6 features.

[Refract]: https://github.com/refractproject/refract-spec

## 0.7.1 (2015-04-10)

This release updates [drafter.js](https://github.com/apiaryio/drafter.js) to v0.2.3

---

*Drafter.js [v0.2.3](https://github.com/apiaryio/drafter.js/releases/tag/v0.2.3)*

## 0.7.0 (2015-03-31)

This release exposes *Relations* and *URI Template* for *Actions* to legacy interface

## 0.6.0 (2015-03-26)

This release introduces API Blueprint Attributes in the legacy blueprint interface.

## 0.4.4 (2015-03-10)

This release removes superfluous logging using console.log.

## 0.4.2 (2015-03-09)

This release brings a fix to API Blueprint version matching regex for UTF8 files starting with BOM.

## 0.3.0 (2015-03-02)

Removed unnecessary dependencies – request.js

## 0.2.0 (2015-03-02)

Re-introduced parser timeouts

## 0.1.0 (2015-02-20)

This release provides only legacy API Blueprint / Apiary Blueprint parser & API interface
