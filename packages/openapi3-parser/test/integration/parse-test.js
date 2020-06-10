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

  it('can parse messageBody example generating message body', () => {
    const file = path.join(__dirname, 'fixtures', 'messageBody');
    return testParseFixture(file, false, false);
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

  describe('regression fixtures', () => {
    it('can parse Dredd #1685', () => {
      const file = path.join(__dirname, 'fixtures', 'regression', 'dredd-1685');
      return testParseFixture(file);
    });
  });
});
