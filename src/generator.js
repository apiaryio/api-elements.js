import faker from 'json-schema-faker';
import annotations from './annotations';

faker.option({
  useDefaultValue: true
});

export function bodyFromSchema(schema, payload, parser) {
  const {Asset} = parser.minim.elements;
  let asset = null;

  try {
    let body = schema.example || JSON.stringify(faker(schema), null, 2);

    asset = new Asset(body);

    asset.classes.push('messageBody');
    asset.contentType = 'application/json';

    payload.content.push(asset);
  } catch (exception) {
    parser.createAnnotation(annotations.DATA_LOST, parser.path,
      'Unable to generate JSON example message body out of JSON Schema');
  }

  return asset;
}

export default {bodyFromSchema};
