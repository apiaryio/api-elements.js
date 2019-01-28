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
});
