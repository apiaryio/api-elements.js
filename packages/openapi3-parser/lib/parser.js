/* eslint-disable no-underscore-dangle */

const R = require('ramda');
const parseYAML = require('./parser/parseYAML');

const { isAnnotation, isObject } = require('./predicates');
const { createError } = require('./elements');
const pipeParseResult = require('./pipeParseResult');

const parseOpenAPIObject = require('./parser/oas/parseOpenAPIObject');

const isObjectOrAnnotation = R.either(isObject, isAnnotation);

const recurseSkippingAnnotations = R.curry((visitor, e) => {
  if (isAnnotation(e)) {
    return e;
  }
  if (e) {
    if (!e.element) {
      return e;
    }

    visitor(e);

    if (e._attributes) {
      e.attributes.forEach((value, key, member) => {
        recurseSkippingAnnotations(visitor, member);
      });
    }
    if (e._meta) {
      e.meta.forEach((value, key, member) => {
        recurseSkippingAnnotations(visitor, member);
      });
    }
    if (e.content) {
      if (Array.isArray(e.content)) {
        e.content.forEach((value) => {
          recurseSkippingAnnotations(visitor, value);
        });
      }
      if (e.content.key) {
        recurseSkippingAnnotations(visitor, e.content.key);
        if (e.content.value) {
          recurseSkippingAnnotations(visitor, e.content.value);
        }
      }
      if (e.content.element) {
        recurseSkippingAnnotations(visitor, e.content);
      }
    }
  }
  return e;
});

function removeSourceMap(e) {
  if (e._attributes) {
    e.attributes.remove('sourceMap');
  }
}

function removeColumnLine(result) {
  if (result._attributes) {
    const sourceMaps = result.attributes.get('sourceMap');
    if (sourceMaps) {
      sourceMaps.content.forEach((sourceMap) => {
        sourceMap.content.forEach((sourcePoint) => {
          sourcePoint.content.forEach((sourceCoordinate) => {
            if (sourceCoordinate._attributes) {
              sourceCoordinate.attributes.remove('line');
              sourceCoordinate.attributes.remove('column');
            }
          });
        });
      });
    }
  }
}

const filterColumnLine = recurseSkippingAnnotations(removeColumnLine);
const filterSourceMaps = recurseSkippingAnnotations(removeSourceMap);

function parse(source, context) {
  const document = parseYAML(source, context);

  const parseDocument = pipeParseResult(context.namespace,
    R.unless(isObjectOrAnnotation, createError(context.namespace, 'Source document is not an object')),
    R.unless(isAnnotation, parseOpenAPIObject(context)),
    context.options.generateSourceMap ? filterColumnLine : filterSourceMaps);

  return R.chain(parseDocument, document);
}

module.exports = parse;
