const R = require('ramda');
const mediaTyper = require('media-typer');
const pipeParseResult = require('../../pipeParseResult');
const { isExtension, hasKey, getValue } = require('../../predicates');
const {
  createWarning,
  createUnsupportedMemberWarning,
  createInvalidMemberWarning,
} = require('../annotations');
const parseObject = require('../parseObject');
const parseSchemaObject = require('./parseSchemaObject');
const parseExampleObject = require('./parseExampleObject');
const parseReference = require('../parseReference');

const name = 'Media Type Object';
const unsupportedKeys = ['encoding'];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

function isJSONMediaType(mediaType) {
  const type = mediaTyper.parse(mediaType);
  return (
    type.type === 'application'
    && (type.subtype === 'json' || type.suffix === 'json')
  );
}

const createJSONMessageBodyAsset = R.curry((namespace, mediaType, value) => {
  const body = JSON.stringify(value.toValue());
  const asset = new namespace.elements.Asset(body);
  asset.classes.push('messageBody');
  asset.contentType = mediaType;
  return asset;
});

function parseExample(namespace, mediaType) {
  const createExampleNotJSONWarning = createWarning(namespace,
    "'Media Type Object' 'example' is only supported for JSON media types");

  return R.ifElse(() => isJSONMediaType(mediaType),
    R.compose(createJSONMessageBodyAsset(namespace, mediaType), getValue),
    createExampleNotJSONWarning);
}

const parseSchemaObjectOrRef = parseReference('schemas', parseSchemaObject);
const parseExampleObjectOrRef = parseReference('examples', parseExampleObject);

/**
 * Parse Media Type Object
 *
 * @param context {Context}
 * @param MessageBodyClass {Class}
 * @param element {Element}
 * @returns ParseResult
 *
 * @see https://github.com/OAI/OpenAPI-Specification/blob/50c152549263cda0f05608d514ba78546b390d0e/versions/3.0.0.md#media-type-object
 * @private
 */
function parseMediaTypeObject(context, MessageBodyClass, element) {
  const { namespace } = context;
  const mediaType = element.key.toValue();

  const createExamplesNotJSONWarning = createWarning(namespace,
    `'${name}' 'examples' is only supported for JSON media types`);

  const parseExamples = pipeParseResult(namespace,
    R.unless(() => isJSONMediaType(mediaType), createExamplesNotJSONWarning),
    parseObject(context, `${name}' 'examples`, R.compose(parseExampleObjectOrRef(context), getValue)),
    (examples) => {
      const parseResult = new namespace.elements.ParseResult();

      if (!examples.isEmpty) {
        const firstExample = examples.first.value;
        const value = firstExample.get('value');
        if (value) {
          parseResult.push(value);
        }
      }

      if (examples.length > 1) {
        parseResult.push(createWarning(namespace, `'${name}' 'examples' only one example is supported, other examples have been ignored`, examples));
      }

      return parseResult;
    },
    createJSONMessageBodyAsset(namespace, mediaType));

  const parseMember = R.cond([
    [hasKey('example'), parseExample(namespace, mediaType)],
    [hasKey('examples'), R.compose(parseExamples, getValue)],
    [hasKey('schema'), R.compose(parseSchemaObjectOrRef(context), getValue)],

    [isUnsupportedKey, createUnsupportedMemberWarning(namespace, name)],

    // FIXME Support exposing extensions into parse result
    [isExtension, () => new namespace.elements.ParseResult()],

    // Return a warning for additional properties
    [R.T, createInvalidMemberWarning(namespace, name)],
  ]);

  const parseMediaType = pipeParseResult(namespace,
    parseObject(context, name, parseMember),
    (mediaTypeObject) => {
      const message = new MessageBodyClass();

      message.headers = new namespace.elements.HttpHeaders([
        new namespace.elements.Member('Content-Type', mediaType),
      ]);

      const messageBody = mediaTypeObject.get('example') || mediaTypeObject.get('examples');
      if (messageBody) {
        message.push(messageBody);
      }

      const dataStructure = mediaTypeObject.get('schema');

      if (!messageBody && dataStructure && isJSONMediaType(mediaType)) {
        let elements = [];
        const { components } = context.state;
        if (components) {
          const schemas = components.get('schemas');
          if (schemas) {
            elements = schemas.content
              .filter(e => e.value && e.value.content)
              .map(e => e.value.content);
          }
        }

        const value = dataStructure.content.valueOf(undefined, elements);

        if (value) {
          const body = JSON.stringify(value);
          const asset = new namespace.elements.Asset(body);
          asset.classes.push('messageBody');
          asset.contentType = mediaType;
          message.push(asset);
        }
      }

      if (dataStructure) {
        message.push(dataStructure);
      }

      // FIXME: We should generate a JSON Schema from the schema

      return message;
    });

  return parseMediaType(element.value);
}

module.exports = R.curry(parseMediaTypeObject);
