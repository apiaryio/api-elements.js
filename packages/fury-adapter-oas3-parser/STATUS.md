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
| info | [~](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/30) |
| servers | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/24) |
| paths | ~ |
| components | ~ |
| security | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/25) |
| tags | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/26) |
| externalDocs | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/27) |

## Info Object

| Field Name | Support |
|:--|:--|
| title | ✓ |
| description | ✓ |
| termsOfService | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/29) |
| contact | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/30) |
| license | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/31) |
| version | ✓ |

## Paths Object

## Path Item Object

| Field Name | Support |
|:--|:--|
| $ref | ✕ |
| summary | ✓ |
| description | ✓ |
| get | [~](#operation-object) |
| put | [~](#operation-object) |
| post | [~](#operation-object) |
| delete | [~](#operation-object) |
| options | [~](#operation-object) |
| head | [~](#operation-object) |
| patch | [~](#operation-object) |
| trace | [~](#operation-object) |
| servers | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/24) |
| parameters | [~](#parameter-location) |

## Operation Object

| Field Name | Support |
|:--|:--|
| tags | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/26) |
| summary | ✓ |
| description | ✓ |
| externalDocs | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/28) |
| operationId | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/34) <kbd>easy first issue</kbd> |
| parameters | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/33) |
| requestBody | ✕ |
| responses | ✕ |
| callbacks | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/36) |
| deprecated | ✕ |
| security | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/25) |
| servers | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/24) |

## Parameter Object

| Field Name | Support |
|:--|:--|
| name | ✓ |
| in | ~ |
| description | ✓ |
| required | [✕](https://github.com/apiaryio/fury-adapter-oas3-parser/issues/48) <kbd>easy first issue</kbd> |
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

### Parameter Location

| Location | Support |
|:--|:--|
| path | ✓ |
| query | ✓ |
| header | ✕ |
| cookie | ✕ |
