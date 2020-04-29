const R = require('ramda');
const contentTyper = require('content-type');
const mediaTyper = require('media-typer');
const pipeParseResult = require('../../pipeParseResult');
const {
  isExtension, hasKey, getKey, getValue,
} = require('../../predicates');
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
  const contentType = contentTyper.parse(mediaType);
  const { type, suffix, subtype } = mediaTyper.parse(contentType.type);
  return type === 'application' && (suffix === 'json' || subtype === 'json');
}

function isTextMediaType(mediaType) {
  const contentType = contentTyper.parse(mediaType);
  const { type } = mediaTyper.parse(contentType.type);
  return type === 'text';
}

function isXMLMediaType(mediaType) {
  const contentType = contentTyper.parse(mediaType);
  const { type, suffix, subtype } = mediaTyper.parse(contentType.type);
  return type === 'application' && (suffix === 'xml' || subtype === 'xml');
}

const canGenerateMessageBodyForMediaType = R.anyPass([isJSONMediaType, isTextMediaType]);

function generateMessageBody(context, mediaType, dataStructure) {
  const elements = {};
  const { components } = context.state;
  if (components) {
    const schemas = components.get('schemas');
    if (schemas) {
      schemas.content
        .filter(e => e.value && e.value.content)
        .forEach((e) => {
          const element = e.value.content;
          elements[element.id.toValue()] = element;
        });
    }
  }

  const value = dataStructure.content.valueOf(undefined, elements);
  if (!value) {
    return undefined;
  }

  let body;
  if (isJSONMediaType(mediaType)) {
    body = JSON.stringify(value);
  } else if (isTextMediaType(mediaType) && typeof value === 'string') {
    body = value;
  } else {
    return undefined;
  }

  const asset = new context.namespace.elements.Asset(body);
  asset.classes.push('messageBody');
  asset.contentType = mediaType;
  return asset;
}

const createJSONMessageBodyAsset = R.curry((namespace, mediaType, value) => {
  const body = JSON.stringify(value.toValue());
  const asset = new namespace.elements.Asset(body);
  asset.classes.push('messageBody');
  asset.contentType = mediaType;
  return asset;
});

const createTextMessageBodyAsset = R.curry((namespace, mediaType, value) => {
  const asset = new namespace.elements.Asset(value.toValue());
  asset.classes.push('messageBody');
  asset.contentType = mediaType;
  return asset;
});

function parseExample(namespace, mediaType) {
  const createExampleNotJSONWarning = createWarning(namespace,
    `'${name}' 'example' is not supported for media type '${mediaType}'`);

  const isTextBasedType = R.anyPass([
    () => isTextMediaType(mediaType),
    () => isXMLMediaType(mediaType),
  ]);

  return R.compose(R.cond([
    [() => isJSONMediaType(mediaType), createJSONMessageBodyAsset(namespace, mediaType)],
    [() => isTextBasedType(mediaType), createTextMessageBodyAsset(namespace, mediaType)],
    [R.T, createExampleNotJSONWarning],
  ]), getValue);
}

const parseSchemaObjectOrRef = parseReference('schemas', parseSchemaObject);
const parseExampleObjectOrRef = parseReference('examples', parseExampleObject);

const isValidMediaType = (mediaType) => {
  try {
    const { type } = contentTyper.parse(mediaType.toValue());
    mediaTyper.parse(type);
  } catch (error) {
    return false;
  }
  return true;
};

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

  const createInvalidMediaTypeWarning = mediaType => createWarning(namespace,
    `'${name}' media type '${mediaType.toValue()}' is invalid`, mediaType);

  const validateMediaType = R.unless(
    R.compose(isValidMediaType, getKey),
    R.compose(createInvalidMediaTypeWarning, getKey)
  );

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
        parseResult.push(createWarning(namespace, `'${name}' 'examples' only one example is supported, other examples have been ignored`, examples.content[1]));
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
    validateMediaType,
    getValue,
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

      if (!messageBody && dataStructure && context.options.generateMessageBody && canGenerateMessageBodyForMediaType(mediaType)) {
        const asset = generateMessageBody(context, mediaType, dataStructure);
        if (asset) {
          message.push(asset);
        }
      }

      if (dataStructure) {
        message.push(dataStructure);
      }

      // FIXME: We should generate a JSON Schema from the schema

      return message;
    });

  return parseMediaType(element);
}

module.exports = R.curry(parseMediaTypeObject);
