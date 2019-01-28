/* eslint-disable no-underscore-dangle */

const R = require('ramda');

const {
  isAnnotation, isExtension, hasKey, getValue,
} = require('../../predicates');
const {
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const pipeParseResult = require('../../pipeParseResult');
const parseObject = require('../parseObject');
const parseOpenAPI = require('../openapi');
const parseInfoObject = require('./parseInfoObject');
const parsePathsObject = require('./parsePathsObject');
const parseComponentsObject = require('./parseComponentsObject');

const name = 'OpenAPI Object';
const requiredKeys = ['openapi', 'info', 'paths'];
const unsupportedKeys = ['servers', 'security', 'tags', 'externalDocs'];

/**
 * Returns whether the given member element is unsupported
 * @param member {MemberElement}
 * @returns {boolean}
 * @see unsupportedKeys
 */
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

function filterSourceMaps(result) {
  if (isAnnotation(result)) {
    return result;
  }
  if (result) {
    if (!result.element) {
      return result;
    }
    if (result._attributes) {
      result.attributes.remove('sourceMap');
      result.attributes.forEach((value, key, member) => {
        filterSourceMaps(member);
      });
    }
    if (result._meta) {
      result.meta.forEach((value, key, member) => {
        filterSourceMaps(member);
      });
    }
    if (result.content) {
      if (Array.isArray(result.content)) {
        result.content.forEach((value) => {
          filterSourceMaps(value);
        });
      }
      if (result.content.key) {
        filterSourceMaps(result.content.key);
        if (result.content.value) {
          filterSourceMaps(result.content.value);
        }
      }
      if (result.content.element) {
        filterSourceMaps(result.content);
      }
    }
  }
  return result;
}

function parseOASObject(context, object) {
  const { namespace } = context;

  // Takes a parse result, and wraps all of the non annotations inside an array
  const asArray = (parseResult) => {
    const array = new namespace.elements.Array(R.reject(isAnnotation, parseResult));
    return new namespace.elements.ParseResult([array].concat(parseResult.annotations.elements));
  };

  // Pre-parse 'components', this needs to be done first since other
  // structures can reference it.
  let components = object.get('components');
  if (components) {
    components = parseComponentsObject(context, components);
    object.set('components', components);

    // eslint-disable-next-line no-param-reassign
    context.state.components = components.reject(isAnnotation).get(0);
  }

  const parseMember = R.cond([
    [hasKey('openapi'), parseOpenAPI(context)],
    [hasKey('info'), R.compose(parseInfoObject(context), getValue)],
    [hasKey('paths'), R.compose(asArray, parsePathsObject(context), getValue)],
    [hasKey('components'), getValue],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOASObject = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys),
    (object) => {
      const api = object.get('info');

      const resources = object.get('paths');
      if (resources) {
        api.content = api.content.concat(resources.content);
      }

      const components = object.get('components');
      if (components) {
        const schemas = components.get('schemas');
        if (schemas) {
          const dataStructures = new namespace.elements.Category(
            schemas.content.map(getValue),
            { classes: ['dataStructures'] }
          );
          api.push(dataStructures);
        }
      }

      return api;
    });


  return context.options.generateSourceMap ? parseOASObject(object) : filterSourceMaps(parseOASObject(object));
}

module.exports = R.curry(parseOASObject);
