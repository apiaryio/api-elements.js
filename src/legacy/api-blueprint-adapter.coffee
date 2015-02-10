BlueprintSDK = require './blueprint'
ObjectHelper = require './object-helper'
Markdown = require './markdown'

trimLastNewline = (s) ->
  unless s
    return

  if s[s.length - 1] is '\n' then s.slice(0, -1) else s

# ## `legacyHeadersFrom1AHeaders`
#
# Turns an array of headers into an object.
#
# ### Input
#
# ```
# [
#   {
#     key: 'Content-Type'
#     value: 'application/json'
#   }
# ]
# ```
#
# ### Output
#
# ```
# {
#   'Content-Type': 'application/json'
# }
# ```
legacyHeadersFrom1AHeaders = (headers) ->
  legacyHeaders = {}
  for own key, header of ObjectHelper.ensureObjectOfObjects(headers) or {} when header?.value?
    legacyHeaders[key] = header.value
  legacyHeaders


# ## `legacyHeadersCombinedFrom1A`
#
# Merges request/response, action, and resource
# headers and outputs an object of the headers.
legacyHeadersCombinedFrom1A = (resOrReq, action, resource) ->
  headers = {}
  cascade = [resource.headers, action.headers, resOrReq?.headers]
  for someHeaders in cascade
    if someHeaders
      for own key, header of legacyHeadersFrom1AHeaders someHeaders
        headers[key] = header
  headers


legacyRequestsFrom1AExamples = (action, resource) ->
  requests = []
  for example, exampleIndex in action.examples or []
    for req in example.requests or []
      requests.push legacyRequestFrom1ARequest req, action, resource, exampleId = exampleIndex

  if requests.length < 1
    return [legacyRequestFrom1ARequest {}, action, resource, exampleId = 0]
  requests


# ## `legacyRequestFrom1ARequest`
#
# Transform 1A Format Request into 'legacy request'
legacyRequestFrom1ARequest = (request, action, resource, exampleId = undefined) ->
  legacyRequest = new BlueprintSDK.Request
    headers: legacyHeadersCombinedFrom1A request, action, resource
    exampleId: exampleId

  if request.description
    legacyRequest.description     = trimLastNewline request.description
    legacyRequest.htmlDescription = trimLastNewline Markdown.toHtmlSync request.description
  else
    legacyRequest.description     = ''
    legacyRequest.htmlDescription = ''

  legacyRequest.reference = request.reference

  legacyRequest.body   = trimLastNewline(request.body)  or ''
  legacyRequest.name   = request.name or ''
  legacyRequest.schema = trimLastNewline(request.schema) or ''

  legacyRequest

legacyResponsesFrom1AExamples = (action, resource) ->
  responses = []
  for example, exampleIndex in action.examples or []
    for resp in example.responses or []
      responses.push legacyResponseFrom1AResponse resp, action, resource, exampleId = exampleIndex
  responses


# ## `legacyResponseFrom1AResponse`
#
# Transform 1A Format Response into 'legacy response'
legacyResponseFrom1AResponse = (response, action, resource, exampleId = undefined) ->
  legacyResponse = new BlueprintSDK.Response
    headers: legacyHeadersCombinedFrom1A response, action, resource
    exampleId: exampleId

  if response.description
    legacyResponse.description     = trimLastNewline response.description
    legacyResponse.htmlDescription = trimLastNewline Markdown.toHtmlSync response.description
  else
    legacyResponse.description     = ''
    legacyResponse.htmlDescription = ''

  legacyResponse.reference = response.reference

  legacyResponse.body   = trimLastNewline(response.body) or ''
  legacyResponse.schema = trimLastNewline(response.schema) or ''

  # `name` and `status` have the same value, ‘API Blueprint AST’ uses
  # the `name` property, see https://github.com/apiaryio/snowcrash/wiki/API-Blueprint-AST-Media-Types.
  legacyResponse.name   = response.name or ''
  legacyResponse.status = response.name or ''

  legacyResponse


# ## `getParametersOf`
#
# Produces an array of URI parameters.
getParametersOf = (obj) ->
  if not obj
    return undefined

  params = []
  paramsObj = ObjectHelper.ensureObjectOfObjects obj.parameters

  for own key, param of paramsObj
    param.key = key
    if param.description
      param.description = Markdown.toHtmlSync param.description
    param.values = ((if typeof item is 'string' then item else item.value) for item in param.values)
    params.push param

  if not params.length
    undefined
  else
    params


# ## `legacyResourcesFrom1AResource`
#
# Transform 1A Format Resource into 'legacy resources', squashing action and resource
# NOTE: One 1A Resource might split into more legacy resources (actions[].transactions[].resource)
legacyResourcesFrom1AResource = (legacyUrlConverterFn, resource) ->
  legacyResources = []

  # resource-wide parameters
  resourceParameters = getParametersOf resource

  for action, actionIndex in resource.actions or []
    # Combine resource & action section, preferring action
    legacyResource = new BlueprintSDK.Resource responses: [], requests: []

    legacyResource.url         = legacyUrlConverterFn resource.uriTemplate
    legacyResource.uriTemplate = resource.uriTemplate

    legacyResource.method = action.method
    legacyResource.name   = resource.name?.trim() or ''

    legacyResource.headers       = legacyHeadersFrom1AHeaders resource.headers
    legacyResource.actionHeaders = legacyHeadersFrom1AHeaders action.headers


    legacyResource.description = trimLastNewline resource.description

    if resource.description?.length
      legacyResource.htmlDescription = trimLastNewline Markdown.toHtmlSync resource.description.trim()
    else
      legacyResource.htmlDescription = ''


    if action.name?.length
      legacyResource.actionName = action.name.trim()
    else
      legacyResource.actionName = ''


    unless !resource.model
      legacyResource.model = resource.model
      legacyResource.model.description = Markdown.toHtmlSync resource.model.description
      legacyResource.model.headers = legacyHeadersFrom1AHeaders resource.model.headers
    else
      legacyResource.model = {}

    legacyResource.resourceParameters = resourceParameters
    legacyResource.actionParameters   = getParametersOf action

    legacyResource.parameters = legacyResource.actionParameters or resourceParameters or undefined

    if action.description
      legacyResource.actionDescription     = trimLastNewline action.description
      legacyResource.actionHtmlDescription = trimLastNewline Markdown.toHtmlSync action.description
    else
      legacyResource.actionDescription     = ''
      legacyResource.actionHtmlDescription = ''

    # Requests - for legacy usage, please, save '.request' too
    requests = legacyRequestsFrom1AExamples action, resource
    legacyResource.requests = requests
    legacyResource.request = requests[0]

    # Responses
    legacyResource.responses = legacyResponsesFrom1AExamples action, resource

    legacyResources.push legacyResource
  legacyResources

# ## `legacyASTfrom1AAST`
#
# This method will hopefully be superseeded by transformOldAstToProtagonist
# once we'll be comfortable with new format and it'll be our default.
legacyASTfrom1AAST = (ast, warnings, cb) ->
  # Blueprint
  legacyAST = new BlueprintSDK.Blueprint
    name: ast.name
    version: BlueprintSDK.Version
    metadata: []

  legacyAST.description = "#{ast.description}".trim() or ''
  legacyAST.htmlDescription = trimLastNewline Markdown.toHtmlSync ast.description

  # Metadata
  metadata = []
  for own metaKey, metaVal of ObjectHelper.ensureObjectOfObjects ast.metadata
    if metaKey is 'HOST'
      legacyAST.location = metaVal.value
      continue
    metadata.push
      name:  metaKey
      value: metaVal.value

  if metadata.length > 0
    legacyAST.metadata = metadata

  legacyUrlConverter = (url) -> url

  if legacyAST.location
    urlWithoutProtocol = legacyAST.location.replace(/^https?:\/\//, "")
    slashIndex         = urlWithoutProtocol.indexOf("/")

    if slashIndex > 0
      urlPrefix = urlWithoutProtocol.slice(slashIndex + 1)

      if urlPrefix isnt ""
        urlPrefix = urlPrefix.replace(/\/$/, "")
        legacyUrlConverter = (url) ->
          "/" + urlPrefix + "/" + url.replace(/^\//, "")

  # Resource Group Section(s) (was: Section)
  for resourceGroup in ast.resourceGroups
    legacySection = new BlueprintSDK.Section
      name: resourceGroup.name
      resources: []

    resourceGroupDescription = resourceGroup.description?.trim()

    if resourceGroupDescription
      legacySection.description =     trimLastNewline resourceGroupDescription
      legacySection.htmlDescription = trimLastNewline Markdown.toHtmlSync resourceGroupDescription
    else
      legacySection.description     = ''
      legacySection.htmlDescription = ''

    # Resources
    for resource in resourceGroup.resources
      resources = legacyResourcesFrom1AResource legacyUrlConverter, resource
      legacySection.resources = legacySection.resources.concat resources

    legacyAST.sections.push legacySection

  cb null, legacyAST, warnings

module.exports = {
  transform: legacyASTfrom1AAST
}
