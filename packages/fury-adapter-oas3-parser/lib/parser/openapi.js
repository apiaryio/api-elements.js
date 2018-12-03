const R = require('ramda');
const { createError, createWarning } = require('../elements');
const { isString } = require('../predicates');

const semanticVersionRE = /^(\d+)\.(\d+).(\d+)$/;

const supportedMinorVersion = 0;
const supportedMajorVersion = 3;

// Parse the OpenAPI Version member
function parseOpenAPI(minim, openapi) {
  if (!isString(openapi.value)) {
    return new minim.elements.ParseResult([createError(minim, 'OpenAPI version is not a string', openapi.value)]);
  }

  const versionInfo = openapi.value.toValue().match(semanticVersionRE);

  if (versionInfo === null) {
    return new minim.elements.ParseResult([createError(minim, `OpenAPI version does not contain valid semantic version string '${openapi.value.toValue()}'`, openapi.value)]);
  }

  if (parseInt(versionInfo[1], 10) !== supportedMajorVersion) {
    return new minim.elements.ParseResult([createError(minim, `Unsupported OpenAPI version '${openapi.value.toValue()}'`, openapi.value)]);
  }

  if (parseInt(versionInfo[2], 10) > supportedMinorVersion) {
    return new minim.elements.ParseResult([createWarning(minim, `Version '${openapi.value.toValue()}' is not fully supported`, openapi.value)]);
  }


  return new minim.elements.ParseResult([]);
}

module.exports = R.curry(parseOpenAPI);
