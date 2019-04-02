const R = require('ramda');
const { createError, createWarning } = require('../elements');
const { isString } = require('../predicates');

const semanticVersionRE = /^(\d+)\.(\d+).(\d+)$/;

const supportedMinorVersion = 0;
const supportedMajorVersion = 3;

// Parse the OpenAPI Version member
function parseOpenAPI(context, openapi) {
  const { namespace } = context;

  if (!isString(openapi.value)) {
    return new namespace.elements.ParseResult([createError(namespace, 'OpenAPI version is not a string', openapi.value)]);
  }

  const versionInfo = openapi.value.toValue().match(semanticVersionRE);

  if (versionInfo === null) {
    return new namespace.elements.ParseResult([createError(namespace, `OpenAPI version does not contain valid semantic version string '${openapi.value.toValue()}'`, openapi.value)]);
  }

  if (parseInt(versionInfo[1], 10) !== supportedMajorVersion) {
    return new namespace.elements.ParseResult([createError(namespace, `Unsupported OpenAPI version '${openapi.value.toValue()}'`, openapi.value)]);
  }

  if (parseInt(versionInfo[2], 10) > supportedMinorVersion) {
    return new namespace.elements.ParseResult([openapi, createWarning(namespace, `Version '${openapi.value.toValue()}' is not fully supported`, openapi.value)]);
  }


  return new namespace.elements.ParseResult([openapi]);
}

module.exports = R.curry(parseOpenAPI);
