{assert} = require 'chai'

bluperintParser = require '../../../lib/legacy/blueprint-parser'
apiBlueprintAdapter = require '../../../lib/legacy/api-blueprint-adapter'
apiaryBlueprintAdapter = require '../../../lib/legacy/apiary-blueprint-adapter'
objectHelper = require '../../../lib/legacy/object-helper'

describe 'Blueprint Tests', ->
  describe 'Version 2 Tests', ->
    describe 'When I send in simple version 2 blueprint', ->
      ast = undefined
      before (done) ->
        code = '''VERSION: 2
               # API name
               '''

        bluperintParser.parse {code}, (err, newAst) ->
          ast = newAst
          done err

      it 'I got API name', ->  assert.equal ast.name, 'API name'

    describe 'When I send in more complex version 2 blueprint', ->
      ast = undefined
      before (done) ->
        code = '''VERSION: 2
               # API name
               Lorem ipsum 1

               # Group Name
               Lorem ipsum 2

               ## /resource
               Lorem ipsum 3

               ### GET
               Lorem ipsum 4

               + Response 200 (text/plain)
                 + Body

                           Hello World
               '''

        bluperintParser.parse {code}, (err, newAst) ->
          ast = newAst
          done err

      it 'I got API name', ->  assert.equal ast.name, 'API name'
      it 'I got API description', ->  assert.equal ast.description, 'Lorem ipsum 1'
      it 'I got API HTML description', ->  assert.equal ast.htmlDescription, '<p>Lorem ipsum 1</p>'
      it 'I got one resource group', ->  assert.equal ast.sections.length, 1
      it 'group has correct name', ->  assert.equal ast.sections[0].name, 'Name'
      it 'group has correct description', ->  assert.equal ast.sections[0].description, 'Lorem ipsum 2'
      it 'group has HTML description', ->  assert.equal ast.sections[0].htmlDescription, '<p>Lorem ipsum 2</p>'
      it 'group has one resource', ->  assert.equal ast.sections[0].resources.length, 1
      it 'resource has correct URI', -> assert.equal ast.sections[0].resources[0].url, '/resource'
      it 'resource has correct description', -> assert.equal ast.sections[0].resources[0].description, 'Lorem ipsum 3\n'
      it 'resource has HTML description', -> assert.equal ast.sections[0].resources[0].htmlDescription, '<p>Lorem ipsum 3</p>'
      it 'resource has action description', -> assert.equal ast.sections[0].resources[0].actionDescription, 'Lorem ipsum 4\n'
      it 'resource has action HTML description', -> assert.equal ast.sections[0].resources[0].actionHtmlDescription, '<p>Lorem ipsum 4</p>'
      it 'resource has correct method', ->  assert.equal ast.sections[0].resources[0].method, 'GET'
      it 'resource has one response', ->  assert.equal ast.sections[0].resources[0].responses.length, 1
      it 'response has correct status', ->  assert.equal ast.sections[0].resources[0].responses[0].status, '200'
      it 'response has correct body', ->  assert.equal ast.sections[0].resources[0].responses[0].body, 'Hello World'

  describe 'Transforming text in AST', ->
    describe 'When I send in simple blueprint with one resource', ->
      ast = undefined
      before (done) ->
        code = '''--- Name ---

        GET /resource
        < 200
        '''

        bluperintParser.parse {code}, (err, newAst) ->
          ast = newAst
          done err

      it 'I got API name',               ->  assert.equal 'Name', ast.name
      it 'I can see my resource url',    ->  assert.equal '/resource', ast.sections[0].resources[0].url
      it 'I can see my resource method', ->  assert.equal 'GET', ast.sections[0].resources[0].method
      it 'I can see my response status', ->  assert.equal 200, ast.sections[0].resources[0].responses[0].status
      it 'I have send nothing in request body', ->
        assert.equal null, ast.sections[0].resources[0].request.body

      it 'I have send nothing in request headers', ->
        assert.deepEqual {}, ast.sections[0].resources[0].request.headers

    describe 'When I send in simple blueprint with one POST resource and headers', ->
      ast = undefined
      before (done) ->
        code = '''--- Name ---

        POST /resource
        > Content-Type: application/json
        { "product":"1AB23ORM", "quantity": 2 }
        < 201
        < Content-Type: application/json
        { "status": "created", "url": "/shopping-cart/2" }
        '''

        bluperintParser.parse {code}, (err, newAst) ->
          ast = newAst
          done err

      it 'I got API name',               ->  assert.equal 'Name', ast.name
      it 'I can see my resource url',    ->  assert.equal '/resource', ast.sections[0].resources[0].url
      it 'I can see my resource method', ->  assert.equal 'POST', ast.sections[0].resources[0].method
      it 'I can see my response status', ->  assert.equal 201, ast.sections[0].resources[0].responses[0].status
      it 'I have send values in request body', ->
        assert.equal '{ "product":"1AB23ORM", "quantity": 2 }', ast.sections[0].resources[0].request.body

      it 'I have send content-type in request headers', ->
        assert.deepEqual {"Content-Type":"application/json"}, ast.sections[0].resources[0].request.headers

    describe 'When I send in blueprint with many empty sections', ->
      it 'should parse in less than 2000ms', ->
        code = '''
--- API ---

-- S1 --

-- S2 --

-- S3 --

-- S4 --

-- S5 --

-- S6 --

-- S7 --

-- S8 --

-- S9 --

-- S10 --

-- S11 --

-- S12 --

-- S13 --

-- S14 --

-- S15 --

-- S16 --

-- S17 --

-- S18 --

-- S19 --

-- S20 --
'''
        parseTimestamp = Date.now() # Since parser is blocking result to comparing timestamps
        bluperintParser.parse {code}, (err, ast) ->
          assert.isNull err
          assert.isDefined ast
          assert.strictEqual ast.sections.length, 20
          assert Date.now() - parseTimestamp < 2000, "parsing not under 2000ms"

  describe "Transformation to application AST from Protagonist AST", ->
    astCaches =
      "0.8":
        _version: "2.0"
        metadata:
          FORMAT: {value: "1A"}
          HOST: {value: "http://www.example.com"}
        name: ""
        description: ""
        resourceGroups: [
          name: ""
          description: ""
          resources: [
            name: "Note"
            description: ""
            uriTemplate: "/notes/{id}"
            model: {}
            headers: {}
            parameters:
              id:
                description: "Numeric `id` of the Note to perform action with. Has example value.\n"
                type: "number"
                required: true
                default: ""
                example: ""
                values: ["A", "B", "C"]
            actions: [
              name: "Retrieve a Note"
              description: ""
              method: "GET"
              parameters: []
              headers: {}
              examples: [
                name: ""
                description: ""
                requests: []
                responses: [
                  name: "200"
                  description: ""
                  headers:
                    "Content-Type": {value: "application/json"}
                    "X-My-Header": {value: "The Value"}
                    "Set-Cookie": {value: "efgh"}
                  body: "{ \"id\": 2, \"title\": \"Pick-up posters from post-office\" }\n"
                  schema: ""
                ]
              ]
            ]
          ]
        ]

      "0.11":
        _version: "2.0"
        metadata: [
          {name: "FORMAT", value: "1A"}
          {name: "HOST", value: "http://www.example.com"}
        ]
        name: ""
        description: ""
        resourceGroups: [
          name: ""
          description: ""
          resources: [
            name: "Note"
            description: ""
            uriTemplate: "/notes/{id}"
            model: {}
            parameters: [
              name: "id"
              description: "Numeric `id` of the Note to perform action with. Has example value.\n"
              type: "number"
              required: true
              default: ""
              example: ""
              values: [
                {value: "A"}
                {value: "B"}
                {value: "C"}
              ]
            ]
            actions: [
              name: "Retrieve a Note"
              description: ""
              method: "GET"
              parameters: []
              examples: [
                name: ""
                description: ""
                requests: []
                responses: [
                  name: "200"
                  description: ""
                  headers: [
                    {name: "Content-Type", value: "application/json"}
                    {name: "X-My-Header", value: "The Value"}
                    {name: "Set-Cookie", value: "abcd"}
                    {name: "Set-Cookie", value: "efgh"}
                  ]
                  body: "{ \"id\": 2, \"title\": \"Pick-up posters from post-office\" }\n"
                  schema: ""
                ]
              ]
            ]
          ]
        ]

    for version, astCache of astCaches
      describe "When I transform an AST from Protagonist v#{version}", ->
        ast = undefined
        before (done) ->
          apiBlueprintAdapter.transform astCache, [], (err, newAst) ->
            ast = newAst
            done err

        it "I got metadata right, with location is aside", ->
          assert.equal ast.location, 'http://www.example.com'
          assert.equal ast.metadata.length, 1
          assert.equal ast.metadata[0].name, 'FORMAT'
          assert.equal ast.metadata[0].value, '1A'

        it "I got headers right", ->
          headers = ast.sections[0].resources[0].responses[0].headers
          assert.equal headers['Content-Type'], 'application/json'
          assert.equal headers['X-My-Header'], 'The Value'
          assert.equal headers['Set-Cookie'], 'efgh'

        it "I got parameters right", ->
          param = ast.sections[0].resources[0].parameters[0]
          assert.equal param.key, 'id'

        it "I got parameter values right", ->
          values = ast.sections[0].resources[0].parameters[0].values
          assert.equal values[0], 'A'
          assert.equal values[1], 'B'
          assert.equal values[2], 'C'

  describe 'Coercing to object of objects from', ->
    describe 'null', ->
      data = undefined
      before ->
        data = objectHelper.ensureObjectOfObjects null
      it 'results in {}', -> assert.deepEqual data, {}

    describe 'object', ->
      data = undefined
      before ->
        data = objectHelper.ensureObjectOfObjects
          'Accept-Language': {'value': 'cs'}
          'Accept': {'value': 'beverage/beer'}
      it 'results in the same object', -> assert.deepEqual data,
        'Accept-Language': {'value': 'cs'}
        'Accept': {'value': 'beverage/beer'}

    describe 'array of objects', ->
      data = undefined
      before ->
        data = objectHelper.ensureObjectOfObjects [
          {'name': 'Accept-Language', 'value': 'cs'}
          {'name': 'Accept', 'value': 'beverage/beer'}
        ]
      it 'results in the right object', -> assert.deepEqual data,
        'Accept-Language': {'value': 'cs'}
        'Accept': {'value': 'beverage/beer'}

    describe 'array of objects with custom key selected', ->
      data = undefined
      before ->
        data = objectHelper.ensureObjectOfObjects [
          {'name': 'Accept-Language', 'value': 'cs'}
          {'name': 'Accept', 'value': 'beverage/beer'}
        ], 'value'
      it 'results in the right object', -> assert.deepEqual data,
        'cs': {'name': 'Accept-Language'}
        'beverage/beer': {'name': 'Accept'}

describe 'Test errors and warnings', ->

  describe 'When I send in simple blueprint with one resource and error', ->
    errors = null
    before (done) ->
      code = '''FORMAT: 1A
      # Name\t

      ## GET /resource

      '''

      bluperintParser.parse {code}, (err, newAst, warnings) ->
        if err
          errors = err
        done()

    it 'I have error code',            ->  assert.equal 2, errors.code
    it 'I have error line',            ->  assert.equal 2, errors.line
    it 'I have error message',         ->  assert.equal "the use of tab(s) \'\\t\' in source data isn\'t currently supported, please contact makers", errors.message
    it 'I have error location index',  ->  assert.equal 17, errors.location[0].index
    it 'I have error location length', ->  assert.equal 1, errors.location[0].length

  describe 'When I send in simple blueprint with one resource and error', ->
    ast = null
    errors = null
    before (done) ->
      code = '''\t--- Name ---

      GET /resource
      < 200
      '''

      bluperintParser.parse {code}, (err, newAst, warnings) ->
        if err
          errors = err
        ast = newAst
        done()

    it 'I have error line',            ->  assert.equal 1, errors.line
    it 'I have error message',         ->  assert.equal 'Expected \"---\", \"HOST:\" or empty line but \"\\t\" found.', errors.message
    it 'I have error column',          ->  assert.equal 1, errors.column

  describe 'When I send in simple blueprint with one resource and warnings', ->
    warn = null
    before (done) ->
      code = '''FORMAT: 1A
      # Name

      ## GET /resource

      ## GET /resource

      '''

      bluperintParser.parse {code}, (err, newAst, warnings) ->
        if warnings then warn = warnings
        ast = newAst
        done err

    it 'I have warning message',           ->  assert.equal "action is missing a response", warn[0].message
    it 'I have warning code',              ->  assert.equal 6, warn[0].code
    it 'I have warning location index',    ->  assert.equal 19, warn[0].location[0].index
    it 'I have warning location length',   ->  assert.equal 18, warn[0].location[0].length
