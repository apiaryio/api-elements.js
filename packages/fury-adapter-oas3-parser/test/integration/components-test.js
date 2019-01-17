const path = require('path');
const testParseFixture = require('./testParseFixture');

const fixtures = path.join(__dirname, 'fixtures', 'components');

describe('components', () => {
  it("'Path Item Object' parameter references", () => {
    const file = path.join(fixtures, 'path-item-object-parameters');
    return testParseFixture(file);
  });
});
