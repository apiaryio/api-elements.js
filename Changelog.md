# Unreleased

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
