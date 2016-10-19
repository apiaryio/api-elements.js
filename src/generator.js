
import querystring from 'querystring';

import faker from 'json-schema-faker';
import annotations from './annotations';
import link from './link';

faker.option({
  useDefaultValue: true,
  maxItems: 5,
  maxLength: 256,
});

export function bodyFromSchema(schema, payload, parser, contentType = 'application/json') {
  const {Asset} = parser.minim.elements;
  let asset = null;

  try {
    let body = schema.example || faker(schema);

    if (typeof(body) !== 'string') {
      if (contentType.indexOf('x-www-form-urlencoded') !== -1) {
        // Form data
        // TODO: check for arrays etc.
        body = querystring.stringify(body);
      } else {
        // JSON
        body = JSON.stringify(body, null, 2);
      }
    }

    asset = new Asset(body);

    asset.classes.push('messageBody');
    asset.contentType = contentType;

    link.inferred('message-body-generation', asset, parser);

    payload.content.push(asset);
  } catch (exception) {
    parser.createAnnotation(annotations.DATA_LOST, parser.path,
      `Unable to generate ${contentType} example message body out of JSON Schema`);
  }

  return asset;
}

export default {bodyFromSchema};
