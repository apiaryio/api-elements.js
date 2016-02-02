# Master

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

# 0.5.0 - 2015-12-8

- Generate Swagger schema and spec validation annotations.
- Implement support for link relations in parser annotations.
- Encode dashes (`-`) in URI template parameters.

# 0.4.0 - 2015-12-2

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
