# 0.9.13 - 2017-02-07

## Bug Fixes

- Handle inheritance for Path level Parameters

# 0.9.12 - 2016-12-13

## Bug Fixes

- Improve handling of default in parameters.

- Prevent a crash on invalid media types, such as `application/json;
  invalid-component` and produce warnings for invalid media types.

# 0.9.11 - 2016-11-25

## Bug Fixes

- Fixes crashes on bad media types.

# 0.9.10 - 2016-11-24

## Bug Fixes

- Circular references in examples will now give a warning about not  being supported yet.

# 0.9.9 - 2016-11-15

## Bug Fixes

- Generates JSON examples for JSON subtypes such as `application/hal+json`.

- Fixes a crash during sourcemap construction for some specific documents

# 0.9.8 - 2016-10-31

## Bug Fixes

- Prevents constructing large arrays and strings when generating a request or
  response body from a JSON Schema where there is a large
  `minItems`, `maxItems`, `minLength` or `maxLength`.

# 0.9.7 - 2016-10-25

## Bug Fixes

- Prevents dereferencing external assets such as local files.

# 0.9.5 - 2016-09-01

## Bug Fixes

- Improves error reporting in some cases when references are involved.

- Improves error reporting when the YAML document contains YAML syntax errors
  to include source maps and the YAML error.

# 0.9.4 - 2016-08-30

# 0.9.3 - 2016-08-30

## Bug Fixes

- Added support to exclude extensions from operations

# 0.9.2 - 2016-08-26

## Enhancements

- Upgraded lodash dependency from 3.x.x to 4.x.x

# 0.9.1 - 2016-07-27

## Enhancements

- Added support for adding example values to parameters using `x-example`

# 0.9.0 - 2016-07-27

## Enhancements

- Added support for parameter property called x-example, which allows to specify
  example values also for non-body parameters.

# 0.8.1 - 2016-07-16

## Enhancements

- The adapter is more asynchronous and thus, gives other events in the event
  loop the ability to run while we're parsing the Swagger document.

# 0.8.0 - 2016-07-01

## Enhancements

- Added authentication support.
- Swagger vendor extensions are now exposes as API Element extensions.
- Response and Request bodies are generated from Schema whenever applicable.
- Accept and Content-type headers are generated based on produces and consumes keys whenever applicable.
- Sample values for non-body parameters are generated whenever applicable.
- Header parameters are appended to request/response header collection.
- Added `formData` support and appropirate request body generation.

## Bug Fixes

- Fixed metadata not being an array of Member Elements.
- Added source maps to resource.href, httpRequest.method, httpResponse.statusCode.
- Removed several unneeded source maps.
- Circular schema references will now give a warning about not being supported yet.
- Added fragment to uncaught error.
- Fixed bug with parameters sourcemaps when they are mixture of body and query parameters.

# 0.7.3 - 2016-04-12

- All exceptions thrown when converting swagger to refract will now be caught and returned as a proper error in parse result

# 0.7.2 - 2016-02-18

- Add an example for testing the module in the browser via TonicDev.

# 0.7.1 - 2016-02-15

- Swagger's `operationId` is now correctly interpreted as transition element's `id` instead of `relation`.

# 0.7.0 - 2016-02-02

- Swagger documents that do not validate against the JSON Schema for Swagger
  will no longer be translated into Refract and instead expose errors for the
  validation failures.

# 0.6.2 - 2016-01-13

- Bad JSON references (using `$ref`) are now returned as parse result
  annotations that include source maps which point to the `$ref` line, making
  debugging easier.

# 0.6.1 - 2016-01-11

- Fix handling of resource `href`, which could get overwritten while processing transitions and result in missing parameters in the URI template.
- Code refactoring

  - Parsing is now handled by a class to more easily share state between various methods. This lays the framework for more refactoring and code cleanup.
  - The parser shared state tracks the path of the component currently being parsed, which makes it easier to split pieces of the parser into separate methods.
  - YAML AST lookup paths are now arrays of strings rather than strings of period-separated components, which made escaping very difficult.
  - Rather than guessing the YAML type, the AST lookup now checks and handles it accordingly. Paths like `'foo.bar.0.baz'` would fail previously and now work (but are passed as `['foo', 'bar', '0', 'baz']`).
  - Underscore is now replaced with Lodash for consistency with other modules.

# 0.6.0 - 2015-12-14

  - Invalid YAML now returns error

# 0.5.3 - 2015-12-11

- Add source maps for YAML parse error annotations, which were previously missing.

# 0.5.2 - 2015-12-10

- Add support for `formData` parameters, which get converted into request data structures.
- Add source maps for `messageBodySchema` assets.

# 0.5.1 - 2015-12-10

- Do not encode JSON strings twice
- Support `x-summary` and `x-description` in Path Item Objects

# 0.5.0 - 2015-12-08

- Generate Swagger schema and spec validation annotations.
- Implement support for link relations in parser annotations.
- Encode dashes (`-`) in URI template parameters.

# 0.4.0 - 2015-12-02

- Implement support for parser annotations.

# 0.3.2 - 2015-11-30

- Implement support for source maps.

# 0.3.1 - 2015-11-25

- Fixes bug where URI templates appended empty query section.
- Fixes additional slashes in URLs when basePath ends with `/`.

# 0.3.0 - 2015-11-18

- Handle Swagger extensions (`x-*` fields).
- Support tags as resource groups when possible.
- Support hostname and basepath.
- Support request parameters when no response is given.
- Better support for HTTP headers.
- Add module for building URI templates from path and operation parameters.

# 0.2.0 - 2015-11-17

- Allow input to be either a loaded object or JSON/YAML string.
- Better JSON Schema reference handling via `json-schema-ref-parser` package.
- Do not set resource titles.
- Use `summary` instead of `operationId` for action titles.
- Set a relation value based on `operationId` for actions.

# 0.1.0 - 2015-09-22

- Initial release.
