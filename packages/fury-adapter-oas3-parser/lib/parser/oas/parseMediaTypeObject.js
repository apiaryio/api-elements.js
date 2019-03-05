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
const parseReference = require('../parseReference');

const name = 'Media Type Object';
const unsupportedKeys = [
  'examples', 'encoding',
];
const isUnsupportedKey = R.anyPass(R.map(hasKey, unsupportedKeys));

function parseExample(namespace, mediaType) {
  const isJSONMediaType = () => {
    const type = mediaTyper.parse(mediaType);
    return (
      type.type === 'application'
      && (type.subtype === 'json' || type.suffix === 'json')
    );
  };

  const parseJSONExample = (example) => {
    const body = JSON.stringify(example.value.toValue());
    const asset = new namespace.elements.Asset(body);
    asset.classes.push('messageBody');
    asset.contentType = mediaType;
    return asset;
  };

  const createExampleNotJSONWarning = createWarning(namespace,
    "'Media Type Object' 'example' is only supported for JSON media types");

  return R.ifElse(isJSONMediaType,
    parseJSONExample,
    createExampleNotJSONWarning);
}

const parseSchema = parseReference('schemas', parseSchemaObject);

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

  const parseMember = R.cond([
    [hasKey('example'), parseExample(namespace, mediaType)],
    [hasKey('schema'), R.compose(parseSchema(context), getValue)],

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

      const messageBody = mediaTypeObject.get('example');
      if (messageBody) {
        message.push(messageBody);
      }

      const dataStructure = mediaTypeObject.get('schema');
      if (dataStructure) {
        message.push(dataStructure);
      }

      // FIXME: We should generate a JSON Schema from the schema

      return message;
    });

  return parseMediaType(element.value);
}

module.exports = R.curry(parseMediaTypeObject);
