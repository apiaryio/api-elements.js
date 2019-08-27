const path = require('path');
const testParseFixture = require('./testParseFixture');

describe('#parse', () => {
  it('can parse petstore example', () => {
    const file = path.join(__dirname, 'fixtures', 'petstore');
    return testParseFixture(file);
  });

  it('can parse petstore example generating source maps', () => {
    const file = path.join(__dirname, 'fixtures', 'petstore');
    return testParseFixture(file, true);
  });

  it('can parse auth schemes', () => {
    const file = path.join(__dirname, 'fixtures', 'auth-scheme');
    return testParseFixture(file);
  });

  it('can parse auth schemes generating source maps', () => {
    const file = path.join(__dirname, 'fixtures', 'auth-scheme');
    return testParseFixture(file, true);
  });

  it('can parse auth schemes global security requirement', () => {
    const file = path.join(__dirname, 'fixtures', 'auth-scheme-global');
    return testParseFixture(file);
  });

  it('can parse auth schemes global security requirement generating source maps', () => {
    const file = path.join(__dirname, 'fixtures', 'auth-scheme-global');
    return testParseFixture(file, true);
  });

  it('can parse non defined auth schemes', () => {
    const file = path.join(__dirname, 'fixtures', 'auth-scheme-does-not-exist');
    return testParseFixture(file);
  });

  it('can parse non defined auth schemes generating source maps', () => {
    const file = path.join(__dirname, 'fixtures', 'auth-scheme-does-not-exist');
    return testParseFixture(file, true);
  });
});
