var assert = require('chai').assert;
var legacyParser = require('../../src/fury').legacyBlueprintParser

describe('Using legacy parser', function() {

  var parserError = null;
  var parsedAPI = null;
  var parserWarnings = null;

  describe('to parse API Blueprint', function() {
    before(function(done) {
      var blueprintSource = 'FORMAT: 1A\n' +
                            '\n' +
                            '# My API\n';

      legacyParser.parse({code: blueprintSource}, function(error, api, warnings) {
        parserError = error;
        parsedAPI = api;
        parserWarnings = warnings;
        done();
      });
    });

    it ('should succeed', function(){
      assert.isNull(parserError);
    });

    it ('API should be defined', function(){
      assert.isDefined(parsedAPI);
    });

    it ('API name should be "My API"', function(){
      assert.equal(parsedAPI.name, 'My API');
    });
  });

  describe('to parse Apiary Blueprint', function() {
    before(function(done) {
      var blueprintSource = '\n--- Sample API v2 ---\n';

      legacyParser.parse({code: blueprintSource}, function(error, api, warnings) {
        parserError = error;
        parsedAPI = api;
        parserWarnings = warnings;
        done();
      });
    });

    it ('should succeed', function(){
      assert.isNull(parserError);
    });

    it ('API should be defined', function(){
      assert.isDefined(parsedAPI);
    });

    it ('API name should be "Sample API v2"', function(){
      assert.equal(parsedAPI.name, 'Sample API v2');
    });
  });
});
