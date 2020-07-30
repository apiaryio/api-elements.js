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
const parseServersArray = require('./parseServersArray');
const parseInfoObject = require('./parseInfoObject');
const parsePathsObject = require('./parsePathsObject');
const parseComponentsObject = require('./parseComponentsObject');
const parseSecurityRequirementsArray = require('./parseSecurityRequirementsArray');

const name = 'OpenAPI Object';
const requiredKeys = ['openapi', 'info', 'paths'];
const unsupportedKeys = ['tags', 'externalDocs'];

/**
 * Returns whether the given member element is unsupported
 * @param member {MemberElement}
 * @returns {boolean}
 * @see unsupportedKeys
 * @private
 */
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

function parseOASObject(context, object) {
  const { namespace } = context;

  // Takes a parse result, and wraps all of the non annotations inside an array
  const asArray = (parseResult) => {
    const array = new namespace.elements.Array(R.reject(isAnnotation, parseResult));
    return new namespace.elements.ParseResult([array].concat(parseResult.annotations.elements));
  };

  const parseMember = R.cond([
    [hasKey('openapi'), parseOpenAPI(context)],
    [hasKey('servers'), R.compose(parseServersArray(context, name), getValue)],
    [hasKey('info'), R.compose(parseInfoObject(context), getValue)],
    [hasKey('components'), R.compose(parseComponentsObject(context), getValue)],
    [hasKey('paths'), R.compose(asArray, parsePathsObject(context), getValue)],
    [hasKey('security'), R.compose(parseSecurityRequirementsArray(context), getValue)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseOASObject = pipeParseResult(namespace,
    parseObject(context, name, parseMember, requiredKeys, ['components']),
    (object) => {
      const api = object.get('info');
      const hosts = object.get('servers');
      const components = object.get('components');
      const security = object.get('security');

      if (components) {
        const schemes = R.or(components.get('securitySchemes'), new namespace.elements.Array());

        if (!schemes.isEmpty) {
          api.push(new namespace.elements.Category(
            schemes.content, { classes: ['authSchemes'] }
          ));
        }
      }

      if (hosts) {
        api.push(hosts);
      }

      const resources = object.get('paths');
      if (resources) {
        api.content = api.content.concat(resources.content);
      }

      api.resources.forEach((resource) => {
        resource.transitions.forEach((transition) => {
          transition.transactions.forEach((transaction) => {
            if (!transaction.authSchemes && security && !security.isEmpty) {
              transaction.attributes.set('authSchemes', security.clone());
            }

            if (transaction.authSchemes && transaction.authSchemes.isEmpty) {
              transaction.attributes.remove('authSchemes');
            }
          });
        });
      });

      if (components) {
        const schemas = R.or(components.get('schemas'), new namespace.elements.Array())
          .content
          .filter(member => member.value)
          .map(getValue);

        if (schemas.length > 0) {
          const dataStructures = new namespace.elements.Category(
            schemas, { classes: ['dataStructures'] }
          );
          api.push(dataStructures);
        }
      }

      return api;
    });

  return parseOASObject(object);
}

module.exports = R.curry(parseOASObject);
