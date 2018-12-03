# OpenAPI Support

The following document contains the list of OpenAPI features that are supported
in the parser per object type.

Key:

| Status | |
|:--|:--|
| Full Support | ✓ |
| Partial Support | ~ |
| Unsupported | ✕ |

## OpenAPI Object

| Field Name | Support |
|:--|:--|
| openapi | ✓ |
| info | [~](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/30) |
| servers | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/24) |
| paths | ~ |
| components | ✕ |
| security | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/25) |
| externalDocs | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/27) |

## Info Object

| Field Name | Support |
|:--|:--|
| title | ✓ |
| description | ✓ |
| termsOfService | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/29) |
| contact | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/30) |
| license | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/31) |
| version | ✓ |

## Paths Object

## Path Item Object

| Field Name | Support |
|:--|:--|
| $ref | ✕ |
| summary | ✓ |
| description | ✓ |
| get | ~ |
| put | ~ |
| post | ~ |
| delete | ~ |
| options | ~ |
| head | ~ |
| patch | ~ |
| trace | ~ |
| servers | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/24) |
| parameters | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/33) |

## Operation Object

| Field Name | Support |
|:--|:--|
| tags | ✕ |
| summary | ✓ |
| description | ✓ |
| externalDocs | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/28) |
| operationId | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/34) |
| parameters | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/33) |
| requestBody | ✕ |
| responses | ✕ |
| callbacks | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/36) |
| deprecated | ✕ |
| security | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/25) |
| servers | [✕](https://github.com/apiaryio/fury-adapter-parser-oas3/issues/24) |

## Parameter Object

| Field Name | Support |
|:--|:--|
| name | ✓ |
| in | ✕ |
| description | ✓ |
| required | ✕ |
| deprecated | ✕ |
| allowEmptyValue | ✕ |

### Serialisation Rules

| Field Name | Support |
|:--|:--|
| style | ✕ |
| explode | ✕ |
| allowReserved | ✕ |
| schema | ✕ |
| example | ✕ |
| examples | ✕ |

### Location

| Location | Support |
|:--|:--|
| path | ✓ |
| query | ✕ |
| header | ✓ |
| cookie | ✓ |
