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
| info | [~](#info-object) |
| servers | [✕](https://github.com/apiaryio/api-elements.js/issues/76) |
| paths | [~](#paths-object) |
| components | ~ |
| security | [✕](https://github.com/apiaryio/api-elements.js/issues/77) |
| tags | [✕](https://github.com/apiaryio/api-elements.js/issues/75) |
| externalDocs | [✕](https://github.com/apiaryio/api-elements.js/issues/82) |

## Info Object

| Field Name | Support |
|:--|:--|
| title | ✓ |
| description | ✓ |
| termsOfService | [✕](https://github.com/apiaryio/api-elements.js/issues/78) |
| contact | [✕](https://github.com/apiaryio/api-elements.js/issues/79) |
| license | [✕](https://github.com/apiaryio/api-elements.js/issues/80) |
| version | ✓ |

## Paths Object

| Field Name | Support |
|:--|:--|
| /{path} | [~](#path-item-object) |

## Path Item Object

| Field Name | Support |
|:--|:--|
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
| servers | [✕](https://github.com/apiaryio/api-elements.js/issues/76) |
| parameters | [~](#parameter-object) |

## Operation Object

| Field Name | Support |
|:--|:--|
| tags | [✕](https://github.com/apiaryio/api-elements.js/issues/75) |
| summary | ✓ |
| description | ✓ |
| externalDocs | [✕](https://github.com/apiaryio/api-elements.js/issues/83) |
| operationId | ✓ |
| parameters | [~](https://github.com/apiaryio/api-elements.js/issues/65) |
| requestBody | ✓ |
| responses | [~](#responses-object) |
| callbacks | [✕](https://github.com/apiaryio/api-elements.js/issues/74) |
| deprecated | ✕ |
| security | ✓ |
| servers | [✕](https://github.com/apiaryio/api-elements.js/issues/76) |

## Parameter Object

| Field Name | Support |
|:--|:--|
| name | ✓ |
| in | [~](#parameter-location) |
| description | ✓ |
| required | ✓ |
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
| header | ✓ |
| cookie | ✕ |

## Request Body Object

| Location | Support |
|:--|:--|
| description | ✓ |
| content | ✓ |
| required | ✕ |

## Responses Object

| Field Name | Support |
|:--|:--|
| default | ✕ |
| HTTP Status Code | [~](#response-object) |

HTTP Status Code ranges are not currently supported.

## Response Object

| Field Name | Support |
|:--|:--|
| description | ✓ |
| headers | [~](#header-object) |
| content | [~](#media-type-object) |
| links | ✕ |

## Media Type Object

| Field Name | Support |
|:--|:--|
| schema | ✓ |
| example | ✓ |
| examples | ~ |
| encoding | ✕ |

## Components Object

See https://github.com/apiaryio/api-elements.js/issues/81 to track referencing
support.

| Field Name | Support |
|:--|:--|
| schemas | ✓ |
| responses | ✓ |
| parameters | ✓ |
| examples | ✓ |
| requestBodies | ✓ |
| headers | [~](#header-object) |
| securitySchemes | [~](#security-scheme-object) |
| links | ✕ |
| callbacks | ✕ |

## Schema Object

| Field Name | Support |
|:--|:--|
| type | ✓ |
| enum | ✓ |
| examples | ✕ |
| encoding | ✕ |
| title | ✕ |
| multipleOf | ✕ |
| maximum | ✕ |
| exclusiveMaximum | ✕ |
| minimum | ✕ |
| exclusiveMinimum | ✕ |
| maxLength | ✕ |
| minLength | ✕ |
| pattern | ✕ |
| maxItems | ✕ |
| minItems | ✕ |
| uniqueItems | ✕ |
| maxProperties | ✕ |
| minProperties | ✕ |
| required | ✓ |
| allOf | ✕ |
| oneOf | ✕ |
| anyOf | ✕ |
| not | ✕ |
| items | ✓ |
| properties | ✓ |
| additionalProperties | ✕ |
| description | ✓ |
| format | ✕ |
| default | ✓ |
| nullable | ✓ |
| discriminator | ✕ |
| readOnly | ✕ |
| writeOnly | ✕ |
| xml | ✕ |
| externalDocs | ✕ |
| example | ✓ |
| deprecated | ✕ |

## Header Object

| Field Name | Support |
|:--|:--|
| description | ✕ |
| required | ✕ |
| deprecated | ✕ |
| allowEmptyValue | ✕ |

## Security Scheme Object

| Field Name | Support |
|:--|:--|
| type | [~](#security-scheme-type) |
| description | ✓ |
| name | ✓ |
| in | ~ |
| scheme | ~ |
| bearerFormat | ✕ |
| flows | ✕ |
| openIdConnectUrl | ✕ |

## Security Scheme Type

| Field Name | Support |
|:--|:--|
| apiKey | ✓ |
| http | ✓ |
| oauth2 | ✕ |
| openIdConnect | ✕ |

## Example Object

| Field Name | Support |
|:--|:--|
| summary | ✕ |
| description | ✕ |
| value | ✓ |
| externalValue | ✕ |
