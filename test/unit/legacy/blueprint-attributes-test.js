var assert = require('chai').assert;
var bluperintParser = require('../../../lib/legacy/blueprint-parser');

describe('Attributes for', function() {
  var source =  'FORMAT: 1A\n\n' +
                '# API\n' +
                '## User [/user]\n' +
                '+ Attributes (Person)\n' +
                '    + id (string) - User id\n\n' +
                '## Retrieve [GET]\n' +
                '+ Response 200\n\n' +
                '## Create [POST]\n' +
                '+ Attributes (Person)\n' +
                '    + email\n\n' +
                '+ Request\n' +
                '    + Attributes (Person)\n\n' +
                '+ Response 201\n\n' +
                '    + Attributes (Person)\n\n' +
                '# Data Structures\n' +
                '## Person (object)\n' +
                '+ name (string)\n\n';

  var parserError = null;
  var parsedAPI = null;
  var parserWarnings = null;

  var resourceAttributes = undefined;
  var actionAttributes = undefined;
  var requestAttributes = undefined;
  var responseAttributes = undefined;

  before(function(done) {
    bluperintParser.parse({code: source}, function(error, api, warnings) {
      parserError = error;
      parsedAPI = api;
      parserWarnings = warnings;

      var tranistion = parsedAPI.sections[0].resources[0]
      resourceAttributes = tranistion.attributes;

      tranistion = parsedAPI.sections[0].resources[1]
      actionAttributes = tranistion.actionAttributes;

      requestAttributes = tranistion.requests[0].attributes

      responseAttributes = tranistion.responses[0].attributes

      done();
    });
  });

  describe('Resource', function() {
    it('are defined', function() {
      assert.isDefined(resourceAttributes);
    });

    it('are of \'dataStructure\' type', function() {
      assert.equal(resourceAttributes.element, 'dataStructure');
    });
  });

  describe('Action', function() {
    it('are defined', function() {
      assert.isDefined(actionAttributes);
    });

    it('are of \'dataStructure\' type', function() {
      assert.equal(actionAttributes.element, 'dataStructure');
    });
  });

  describe('Request', function() {
    it('are defined', function() {
      assert.isDefined(requestAttributes);
    });

    it('are of \'dataStructure\' type', function() {
      assert.equal(requestAttributes.element, 'dataStructure');
    });
  });

  describe('Response', function() {
    it('are defined', function() {
      assert.isDefined(responseAttributes);
    });

    it('are of \'dataStructure\' type', function() {
      assert.equal(responseAttributes.element, 'dataStructure');
    });
  });

});

describe('Data Structure section', function() {
  var source =  'FORMAT: 1A\n\n' +
                '# API\n' +
                '# Data Structures\n' +
                '## Person (object)\n' +
                '+ name (string)\n\n';

  var parserError = null;
  var parsedAPI = null;
  var parserWarnings = null;

  before(function(done) {
    bluperintParser.parse({code: source}, function(error, api, warnings) {
      parserError = error;
      parsedAPI = api;
      parserWarnings = warnings;

      done();
    });
  });

  it ('is defined', function() {
    assert.isDefined(parsedAPI.dataStructures);
    assert.isArray(parsedAPI.dataStructures);
  });

  it ('contains one element', function() {
    assert.equal(parsedAPI.dataStructures.length, 1);
  });

  it ('the element is of \'dataStructure\' type', function() {
    assert.equal(parsedAPI.dataStructures[0].element, 'dataStructure');
  });

});

describe('Expose relation and urlTemplate for action', function() {
  var source =  'FORMAT: 1A\n\n' +
                '# API\n' +
                '## User [/user]\n\n' +
                '## Retrieve [GET /user/{id}]\n\n' +
                '+ Relation: fetch\n\n' +
                '+ Response 200\n\n' +
                '## Create [POST]\n\n' +
                '+ Response 201\n\n';

  var parserError = null;
  var parsedAPI = null;
  var parserWarnings = null;

  var getAction = null;
  var postAction = null;

  before(function(done) {
    bluperintParser.parse({code: source}, function(error, api, warnings) {
      parserError = error;
      parsedAPI = api;
      parserWarnings = warnings;

      getAction = parsedAPI.sections[0].resources[0];
      postAction = parsedAPI.sections[0].resources[1];

      done();
    });
  });

  it ('is defined', function() {
    assert.isDefined(getAction.actionRelation);
    assert.isDefined(getAction.actionUriTemplate);

    assert.isDefined(postAction.actionRelation);
    assert.isDefined(postAction.actionUriTemplate);
  });

  it ('is correctly set', function() {
    assert.equal(getAction.actionRelation, 'fetch');
    assert.equal(getAction.actionUriTemplate, '/user/{id}');

    assert.equal(postAction.actionRelation, '');
    assert.equal(postAction.actionUriTemplate, '');
  });

  it ('is equal to url when advanced action', function () {
    assert.equal(getAction.url, getAction.actionUriTemplate);
  });

});
