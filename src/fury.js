function foo(number) {
  return number + 1
}

var fury = {}

fury.foo = foo
fury.legacyAPI = require('./legacy/blueprint');
fury.legacyBlueprintParser = require('./legacy/blueprint-parser');

module.exports = fury;
