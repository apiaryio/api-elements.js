# API Elements CLI

Command line interface for [API Elements](https://apielements.org)
and the [API Elements JavaScript
tooling](https://apielements.org/projects/js/).

## Install

```shell
$ npm install -g @apielements/cli
```

## Usage

```
$ fury --help

  Usage: fury [options] <input> [output]

  Command line tool the Fury.JS

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -f, --format [format]  output format
    -l, --validate         validate input only
    -s, --sourcemap        Export sourcemaps into API Elements parse result
    --shell                Launch an interactive shell to interact with parse result
    --adapter [adapter]    Load a fury adapter
```

#### Input Formats

Fury will accept API Description documents as the first argument, this can
either be a `-` to accept stdin or a file path. The document can be any of the
following formats:

- API Blueprint
- OpenAPI 2 (Swagger)
- OpenAPI 3
- *Legacy* Apiary Blueprint

Fury will detect the API format you have used from the input document.

#### Output Formats

The format argument allows you to provide the format to output the API
Description. This can either be an API Elements parse result, or another API
Description format.

- API Elements (JSON) `application/vnd.refract.parse-result+json` (default)
- API Elements (YAML) `application/vnd.refract.parse-result+yaml`
- API Blueprint `text/vnd.apiblueprint`

### Converting OpenAPI to API Blueprint

As an example, you can use Fury to convert both OpenAPI 2 or OpenAPI 3 API
Description Documents into API Blueprint.

```shell
$ fury --format text/vnd.apiblueprint openapi.json apiary.apib
```

### Converting OpenAPI 3 to API Blueprint

As an example, you can use Fury to convert a Swagger API Description into API
Blueprint.

```shell
$ fury --format text/vnd.apiblueprint swagger.json apiary.apib
```

### Converting a legacy Apiary Blueprint to API Blueprint

Fury allows you to convert a *legacy* Apiary Blueprint to the API Blueprint
format.

```shell
$ fury --format text/vnd.apiblueprint legacy.txt blueprint.apib
```
