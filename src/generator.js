import faker from 'json-schema-faker';
import annotations from './annotations';

export function bodyFromSchema(schema, parser) {
  const {Asset} = parser.minim.elements;
  let asset = null

  try {
    asset = new Asset(JSON.stringify(faker(schema), null, 2));

    asset.classes.push('messageBody');
    asset.attributes.set('contentType', 'application/json');
  } catch (exception) {
    parser.createAnnotation(annotations.DATA_LOST, parser.path,
      'Unable to generate JSON example message body out of JSON Schema');
  }

  return asset;
}

export default {bodyFromSchema};
