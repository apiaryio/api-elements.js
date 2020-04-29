// These describe the type of annotations that are produced by this parser
// and assigns a unique code to each one. Downstream applications can use this
// code to group similar types of annotations together.
module.exports = {
  CANNOT_PARSE: {
    type: 'error',
    code: 1,
    fragment: 'yaml-parser',
  },
  AST_UNAVAILABLE: {
    type: 'warning',
    code: 2,
    fragment: 'yaml-parser',
  },
  DATA_LOST: {
    type: 'warning',
    code: 3,
    fragment: 'refract-not-supported',
  },
  VALIDATION_ERROR: {
    type: 'error',
    code: 4,
    fragment: 'swagger-validation',
  },
  UNCAUGHT_ERROR: {
    type: 'error',
    code: 5,
    fragment: 'uncaught-error',
  },
  VALIDATION_WARNING: {
    type: 'warning',
    code: 6,
    fragment: 'swagger-validation',
  },
};
