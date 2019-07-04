#!/usr/bin/env bash

set -e

TMPDIR="$(mktemp -d)"
PROJECT_DIR="$(pwd)"

create_package() {
  cd "$TMPDIR" && npm init --yes && cd "$PROJECT_DIR"
}

install() {
  PACKAGE="$1"

  TARBALL="$(cd packages/$PACKAGE && npm pack | tail -n1)"
  mv "packages/$PACKAGE/$TARBALL" "$TMPDIR"

  cd "$TMPDIR" && npm install "$TARBALL" && cd "$PROJECT_DIR"
}

echo "Setting up Fury in $TMPDIR"

create_package
install fury
install fury-adapter-apib-parser
install fury-adapter-oas3-parser
install fury-adapter-apiary-blueprint-parser
install fury-adapter-apib-serializer
install fury-cli

cd "$TMPDIR"
npx fury --help
npx fury --version

# Parse Apiary Blueprint
cat << EOF | npx fury -
HOST: http://example.com/

--- Sample API v2 ---
---
Welcome to the our sample API documentation. All comments can be written in (support [Markdown](http://daringfireball.net/projects/markdown/syntax) syntax)
---
EOF

# Parse API Blueprint
cat << EOF | npx fury -
FORMAT: 1A

# GET /

+ Response 204
EOF

# Parse OpenAPI 2.0
cat << EOF | npx fury -
swagger: '2.0'
info:
  title: My API
  version: 1.0.0
paths: {}
EOF

# Parse OpenAPI 3.0
cat << EOF | npx fury -
openapi: 3.0.2
info:
  title: My API
  version: 1.0.0
paths: {}
EOF

rm -fr "$TMPDIR"
