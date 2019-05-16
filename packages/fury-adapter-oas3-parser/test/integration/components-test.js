const path = require('path');
const testParseFixture = require('./testParseFixture');

const fixtures = path.join(__dirname, 'fixtures', 'components');

describe('components', () => {
  describe('Path Item Object', () => {
    it('handles parameter references', () => {
      const file = path.join(fixtures, 'path-item-object-parameters');
      return testParseFixture(file);
    });

    it('handles multiple references to same parameter', () => {
      const file = path.join(fixtures, 'path-item-object-parameters-multiple');
      return testParseFixture(file);
    });

    it('handles parameter referencing unsupported parameter', () => {
      const file = path.join(fixtures, 'path-item-object-parameters-unsupported-parameter');
      return testParseFixture(file);
    });
  });

  describe('Media Type Object', () => {
    it('handles schema references', () => {
      const file = path.join(fixtures, 'media-type-object-schema');
      return testParseFixture(file);
    });

    it('handles multiple references to same schema', () => {
      const file = path.join(fixtures, 'media-type-object-schema-multiple');
      return testParseFixture(file);
    });

    it('handles examples references', () => {
      const file = path.join(fixtures, 'media-type-object-examples');
      return testParseFixture(file);
    });
  });

  describe('Responses Object', () => {
    it('handles response references', () => {
      const file = path.join(fixtures, 'responses-object-response');
      return testParseFixture(file);
    });

    it('handles multiple references to same response', () => {
      const file = path.join(fixtures, 'responses-object-response-multiple');
      return testParseFixture(file);
    });

    it('handles response references with schema', () => {
      const file = path.join(fixtures, 'responses-object-response-with-schema');
      return testParseFixture(file);
    });

    it('handles responses references with headers', () => {
      const file = path.join(fixtures, 'responses-object-response-with-headers');
      return testParseFixture(file);
    });
  });

  describe('Response Object', () => {
    it('handles headers references', () => {
      const file = path.join(fixtures, 'response-object-headers');
      return testParseFixture(file);
    });

    it('handles multiple references to same header', () => {
      const file = path.join(fixtures, 'response-object-headers-multiple');
      return testParseFixture(file);
    });
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
