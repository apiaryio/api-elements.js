var Foo = {}

function foo(number) {
  return number + 1
}

Foo.foo = foo
Foo.LegacyBlueprint = require('./legacy/blueprint');
Foo.LegacyBlueprintParser = require('./legacy/blueprint-parser');

module.exports = Foo;
