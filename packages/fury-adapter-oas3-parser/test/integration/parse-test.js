const path = require('path');
const testParseFixture = require('./testParseFixture');

describe('#parse', () => {
  it('can parse petstore example', () => {
    const file = path.join(__dirname, 'fixtures', 'petstore');
    return testParseFixture(file);
  });
});
