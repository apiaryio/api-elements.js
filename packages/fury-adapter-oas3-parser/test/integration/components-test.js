const path = require('path');
const testParseFixture = require('./testParseFixture');

const fixtures = path.join(__dirname, 'fixtures', 'components');

describe('components', () => {
  it("'Path Item Object' parameter references", () => {
    const file = path.join(fixtures, 'path-item-object-parameters');
    return testParseFixture(file);
  });

  it("'Path Item Object' parameter referencing unsupported parameter", () => {
    const file = path.join(fixtures, 'path-item-object-parameters-unsupported-parameter');
    return testParseFixture(file);
  });

  it("'Media Type Object' schema references", () => {
    const file = path.join(fixtures, 'media-type-object-schema');
    return testParseFixture(file);
  });

  it("'Media Type Object' examples references", () => {
    const file = path.join(fixtures, 'media-type-object-examples');
    return testParseFixture(file);
  });

  it("'Responses Object' response references", () => {
    const file = path.join(fixtures, 'responses-object-response');
    return testParseFixture(file);
  });

  it("'Responses Object' response references with schema", () => {
    const file = path.join(fixtures, 'responses-object-response-with-schema');
    return testParseFixture(file);
  });

  it("'Response Object' headers references", () => {
    const file = path.join(fixtures, 'response-object-headers');
    return testParseFixture(file);
  });

  it("'Schema Object' circular references", () => {
    const file = path.join(fixtures, 'schema-object-circular');
    return testParseFixture(file);
  });

  it("'Operation Object' requestBody references", () => {
    const file = path.join(fixtures, 'operation-object-requestBody');
    return testParseFixture(file);
  });
});
