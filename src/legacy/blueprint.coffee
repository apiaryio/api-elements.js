CURRENT_AST_VERSION = 18

fillProps = (object, props, defaults) ->
  for key of defaults
    object[key] = props[key] ? defaults[key]

combineParts = (separator, builder) ->
  parts = []
  builder(parts)
  parts.join(separator)

escapeBody = (body) ->
  if /^>\s+|^<\s+|^\s*$/m.test(body)
    if /^>>>\s*$/m.test(body)
      if /^EOT$/m.test(body)
        i = 1
        while /^EOT#{i}$/m.test(body)
          i++
        "<<<EOT#{i}\n#{body}\nEOT#{i}"
      else
        "<<<EOT\n#{body}\nEOT"
    else
      "<<<\n#{body}\n>>>"
  else
    body


class Blueprint
  @fromJSON: (json = {}) ->
    new this
      location:        json.location        # `HOST` metadata
      name:            json.name            # Name of the API
      metadata:        json.metadata        # Array of metadata, e.g. `[ { value: '1A', name: 'FORMAT' } ]`
      version:         json.version         # Proprietary version of the Application AST (e.g. 17), see http://git.io/bbDJ
      description:     json.description     # Description of the API (in Markdown)
      htmlDescription: json.htmlDescription # Rendered description of the API
      sections:        Section.fromJSON(s) for s in json.sections or [] # Array of resource groups
      validations:     JsonSchemaValidation.fromJSON(v) for v in json.validations or [] # Array of JSON Schemas
      dataStructures:  json.dataStructures  # Array of data struture elements

  constructor: (props = {}) ->
    fillProps this, props,
      location:        null
      name:            null
      metadata:        null
      version:         1.0
      description:     null
      htmlDescription: null
      sections:        []
      validations:     []
      dataStructures:  []

  # ### `resources`
  #
  # Returns a list of resources. You can filter the list
  # by the `opts` object.
  #
  # `resources method: 'GET'` returns resources
  # with `GET` HTTP method.
  #
  # `resources url: '/notes'` returns resources
  # with `/notes` URI template.
  resources: (opts) ->
    # Resource, see line #133 for more details.
    resources = []
    for s in @sections then for r in s.resources
      if opts?.method and opts.method isnt r.method then continue
      if opts?.url and opts.url isnt r.url then continue
      resources.push r
    return resources

  getUrlPrefixPosition: ->

    urlPrefixPosition = 0

    if @location
      urlWithoutProtocol = @location.replace(/^https?:\/\//, "")
      slashIndex         = urlWithoutProtocol.indexOf("/")

      if slashIndex > 0
        urlPrefixPosition = urlWithoutProtocol.slice(slashIndex + 1).length

    return urlPrefixPosition

  toJSON: ->
    urlPrefixPosition = @getUrlPrefixPosition()
    return {
      @location
      @name
      @metadata
      @version
      @description
      @htmlDescription
      sections:    s.toJSON(urlPrefixPosition) for s in @sections
      validations: v.toJSON(urlPrefixPosition) for v in @validations
      @dataStructures
    }

  # ### `toBlueprint`
  #
  # Turns the AST into a blueprint. Outputs
  # Legacy Blueprint Format.
  toBlueprint: ->
    urlPrefixPosition = @getUrlPrefixPosition()

    combineParts "\n\n", (parts) =>
      parts.push "HOST: #{@location}"        if @location
      parts.push "--- #{@name} ---"          if @name
      parts.push "---\n#{"#{@description}".trim()}\n---" if @description

      parts.push s.toBlueprint(urlPrefixPosition) for s in @sections

      parts.push "-- JSON Schema Validations --" if @validations.length > 0
      parts.push v.toBlueprint(urlPrefixPosition) for v in @validations

# ## `Section`
#
# Resource Group.
class Section
  @fromJSON: (json = {}) ->
    new this
      name:            json.name            # Name of the resource group
      description:     json.description     # Markdown description of the resource group
      htmlDescription: json.htmlDescription # Rendered description of the resource group
      resources:       Resource.fromJSON(r) for r in json.resources or [] # Array of resources

  constructor: (props = {}) ->
    fillProps this, props,
      name:            null
      description:     null
      htmlDescription: null
      resources:       []

  toJSON: (urlPrefixPosition) -> return {
    @name
    @description
    @htmlDescription
    resources: r.toJSON(urlPrefixPosition) for r in @resources or []
  }

  # ### `toBlueprint`
  #
  # Turns the AST into a blueprint. Outputs
  # Legacy Blueprint Format.
  toBlueprint: (urlPrefixPosition) ->
    combineParts "\n\n", (parts) =>
      if @name
        if @description
          parts.push "--\n#{@name}\n#{"#{@description}".trim()}\n--"
        else
          parts.push "-- #{@name} --"

      parts.push "#{r.toBlueprint(urlPrefixPosition)}\n" for r in @resources or []


# ## `Resource`
#
# Represents an action (transition), inherits properties from a resource (e.g. `uriTemplate`,
# `headers`, `name`, ...).
class Resource
  @fromJSON: (json = {}) ->
    new this
      method:              json.method      # HTTP method of the action

      # URI of the resource including path from the `HOST` metadata.
      # E.g. `/v2/notes`, where `/v2` is path from the `HOST` metadata,
      # `/notes` is URI template of the resource.
      url:                 json.url

      uriTemplate:         json.uriTemplate # URI template of the resoruce
      name:                json.name        # Name of the resource
      nameMethod:          json.nameMethod  # Deprecated, use `actionName`
      actionName:          json.actionName  # Name of the action
      actionDescription:   json.actionDescription       # Markdown description of the action
      actionHtmlDescription: json.actionHtmlDescription # Rendered description of the action
      description:         json.description         # Markdown description of the resource
      htmlDescription:     json.htmlDescription     # Rendered description of the resource
      descriptionMethod:   json.descriptionMethod   # Deprecated, use `htmlDescription`
      resourceDescription: json.resourceDescription # Deprecated, use `htmlDescription`
      model:               json.model               # Resource model
      headers:             json.headers             # Resource and action headers
      actionHeaders:       json.actionHeaders       # Action headers
      parameters:          json.parameters          # Resource and action URI parameters
      resourceParameters:  json.resourceParameters  # Resource URI parameters
      actionParameters:    json.actionParameters    # Action URI parameters
      request:             if json.request then Request.fromJSON(json.request) else json.request # First request in the `request` array
      requests:            Request.fromJSON(r) for r in json.requests or []   # Array of requests
      responses:           Response.fromJSON(r) for r in json.responses or [] # Array of responses
      attributes:          json.attributes          # Resource attributes
      resolvedAttributes:  json.resolvedAttributes  # Expanded resource attributes
      actionAttributes:    json.actionAttributes    # Action attributes
      resolvedActionAttributes: json.resolvedActionAttributes # Expanded action attributes
      actionRelation:      json.actionRelation
      actionUriTemplate:   json.actionUriTemplate

  constructor: (props = {}) ->
    fillProps this, props,
      method:              'GET'
      url:                 '/'
      uriTemplate:         ''
      name:                undefined
      nameMethod:          undefined # deprecated
      actionName:          undefined
      actionDescription:   undefined
      actionHtmlDescription: undefined
      description:         undefined
      htmlDescription:     undefined
      descriptionMethod:   undefined # deprecated
      resourceDescription: undefined # deprecated
      model:               undefined
      headers:             undefined
      actionHeaders:       undefined
      parameters:          undefined
      resourceParameters:  undefined
      actionParameters:    undefined
      request:             undefined
      requests:            []
      responses:           []
      attributes:          undefined
      resolvedAttributes:  undefined
      actionAttributes:    undefined
      resolvedActionAttributes: undefined
      actionRelation:      undefined
      actionUriTemplate:   undefined

  getUrlFragment: -> "#{@method.toLowerCase()}-#{encodeURIComponent @url}"

  # Returns array of "examples", each having 'requests' and 'responses'
  # properties containing arrays of corresponding items. The array is sorted
  # by exampleId, so "examples" should appear in the same order as they
  # were defined in the original blueprint.
  getExamples: ->
    ids = []
    examples = []

    for name in ['requests', 'responses']
      for reqOrResp in @[name] or []
        key = parseInt(reqOrResp.exampleId, 10) or 0
        if not examples[key]?
          examples[key] =
            requests: []
            responses: []
        examples[key][name].push reqOrResp

    return examples

  toJSON: (urlPrefixPosition) -> return {
    @method
    @url
    uriTemplate: @uriTemplate or (if urlPrefixPosition then @url.slice(urlPrefixPosition) else '')
    @name
    @nameMethod # deprecated
    @actionName
    @actionDescription
    @actionHtmlDescription
    @description
    @htmlDescription
    @descriptionMethod # deprecated
    @resourceDescription # deprecated
    @model
    @headers
    @actionHeaders
    @parameters
    @resourceParameters
    @actionParameters
    request:     @request?.toJSON()
    requests:    r.toJSON() for r in @requests or []
    responses:   r.toJSON() for r in @responses or []
    @attributes
    @resolvedAttributes
    @actionAttributes
    @resolvedActionAttributes
    @actionRelation
    @actionUriTemplate
  }

  # ### `toBlueprint`
  #
  # Turns the AST into a blueprint. Outputs
  # Legacy Blueprint Format.
  toBlueprint: (urlPrefixPosition = 0) ->
    combineParts "\n", (parts) =>
      parts.push "#{@description}".trim() if @description
      parts.push "#{@method} #{@url.slice(urlPrefixPosition)}"

      requestBlueprint = @request?.toBlueprint()
      parts.push requestBlueprint if requestBlueprint

      responsesBlueprint = combineParts "\n+++++\n", (parts) =>
        parts.push r.toBlueprint() for r in @responses or []
      parts.push responsesBlueprint if responsesBlueprint


class Request
  @fromJSON: (json = {}) ->
    new this
      name:        json.name                # Name of the request
      description: json.description         # Markdown description of the request
      htmlDescription: json.htmlDescription # Rendered description of the request
      headers:     json.headers
      reference:   json.reference
      body:        json.body
      schema:      json.schema
      exampleId:   json.exampleId
      attributes:  json.attributes          # Request attributes
      resolvedAttributes: json.resolvedAttributes # Expanded request attributes

  constructor: (props = {}) ->
    fillProps this, props,
      name:        undefined
      description: undefined
      htmlDescription: undefined
      headers:     {}
      reference:   undefined
      body:        undefined
      schema:      undefined
      exampleId:   0
      attributes:  undefined
      resolvedAttributes: undefined

  toJSON: -> return {
    @name
    @description
    @htmlDescription
    @headers
    @reference
    @body
    @schema
    @exampleId
    @attributes
    @resolvedAttributes
  }

  # ### `toBlueprint`
  #
  # Turns the AST into a blueprint. Outputs
  # Legacy Blueprint Format.
  toBlueprint: ->
    combineParts "\n", (parts) =>
      parts.push "> #{name}: #{value}" for name, value of @headers
      parts.push escapeBody(@body) if @body


class Response
  @fromJSON: (json = {}) ->
    new this
      status:      json.status
      description: json.description
      htmlDescription: json.htmlDescription
      headers:     json.headers
      reference:   json.reference
      body:        json.body
      schema:      json.schema
      exampleId:   json.exampleId
      attributes:  json.attributes
      resolvedAttributes: json.resolvedAttributes

  constructor: (props = {}) ->
    fillProps this, props,
      status:      200
      description: undefined
      htmlDescription: undefined
      headers:     {}
      reference:   undefined
      body:        undefined
      schema:      undefined
      exampleId:   0
      attributes:  undefined
      resolvedAttributes: undefined

  toJSON: -> return {
    @status
    @description
    @htmlDescription
    @headers
    @reference
    @body
    @schema
    @exampleId
    @attributes
    @resolvedAttributes
  }

  # ### `toBlueprint`
  #
  # Turns the AST into a blueprint. Outputs
  # Legacy Blueprint Format.
  toBlueprint: ->
    combineParts "\n", (parts) =>
      parts.push "< #{@status}"
      parts.push "< #{name}: #{value}" for name, value of @headers
      parts.push escapeBody(@body) if @body


class JsonSchemaValidation
  @fromJSON: (json = {}) ->
    new this
      status: json.status
      method: json.method
      url:    json.url
      body:   json.body

  constructor: (props = {}) ->
    fillProps this, props,
      status: undefined
      method: "GET"
      url:    "/"
      body:   undefined

  toJSON: -> return {
    @status
    @method
    @url
    @body
  }

  # ### `toBlueprint`
  #
  # Turns the AST into a blueprint. Outputs
  # Legacy Blueprint Format.
  toBlueprint: (urlPrefixPosition = 0) ->
    combineParts "\n", (parts) =>
      parts.push "#{@method} #{@url.slice(urlPrefixPosition)}"
      parts.push escapeBody(@body) if @body

class DataStructure


module.exports = {
  Blueprint
  Section
  Resource
  Request
  Response
  Version: CURRENT_AST_VERSION
}
