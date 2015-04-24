var assert = require('chai').assert;
var bluperintParser = require('../../../lib/legacy/blueprint-parser');

describe('Legacy blueprint parser', function() {
  describe('recognizes Format 1A', function() {

    var source =  'FORMAT: 1A\n\n' +
                  '#My API\n';

    it('verbatim', function() {
      assert.ok(bluperintParser.newVersionRegExp.test(source));
    });

    it('with UTF8 BOM', function() {
      var bomSource = '\uFEFF' + source;
      assert.ok(bluperintParser.newVersionRegExp.test(bomSource));
    });
  });

  describe('recognizes legacy format', function() {

    var source =  'HOST: http://www.google.com/\n\n' +
                  '--- Sample API v2 ---\n';

    it('verbatim', function() {
      assert.notOk(bluperintParser.newVersionRegExp.test(source));
    });

    it('with UTF8 BOM', function() {
      var bomSource = '\uFEFF' + source;
      assert.notOk(bluperintParser.newVersionRegExp.test(bomSource));
    });
  });

});
