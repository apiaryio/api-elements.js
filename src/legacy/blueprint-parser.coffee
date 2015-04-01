#
# Legacy Blueprint parsing interface
#
apiaryBlueprintParser = require 'apiary-blueprint-parser'
Drafter = require 'drafter'

DefaultFuryEmitter = require '../fury-emitter'
apiBlueprintAdapter = require './api-blueprint-adapter'
apiaryBlueprintAdapter = require './apiary-blueprint-adapter'

NEW_VERSION_REGEXP = new RegExp '^[\uFEFF]?(((VERSION:( |\t)2)|(FORMAT:( |\t)(X-)?1A))\n)', 'i'

STRICT_OPTIONS =
  requireBlueprintName: true

# Default async parser timeout
process.env.PARSER_TIMEOUT ?= 10000
PARSER_TIMEOUT = parseInt process.env.PARSER_TIMEOUT, 10

countLines = (code, index) ->
  if index > 0
    excerpt = code.substr 0, index
    return excerpt.split(/\r\n|\r|\n/).length
  else
    return 1

# ## `getLocalAst`
#
# Parses API blueprint, gets AST and
# transforms the AST in the Application AST.
#
# @param [String] code source to be parsed
# @param [String] blueprintId identifier of the blueprint being parsed
# @param [Boolean] sourcemap true to produce source map, false otherwise
# @param [EventEmitter] emitter to be used for reporting
getLocalAst = ({code, blueprintId, sourcemap, emitter}, cb) ->
  blueprintId ?= ''
  emitter ?= DefaultFuryEmitter()

  if code.match(NEW_VERSION_REGEXP)
    # Parsing new API Blueprint (>= Format 1A )

    parseHasFinished = false

    # Handle parsing timeout
    #   do nothing if parsing has already finished otherwise stop parsing & fire
    #   an error
    timeoutHandler = ->
      if parseHasFinished then return
      parseHasFinished = true

      errorType = 'PARSE_TIMEOUT'
      errorMessage = "Parsing of #{blueprintId} has timed out"

      emitter.emit 'error', errorType + ' ' + errorMessage

      err = new Error(errorMessage);
      err.errType = errorType
      err.message = ''.concat err.toString()
      err.description = ''.concat err.toString()
      err.location = [{index: 1, length: 0}]
      err.line = 1

      return cb err

    # Prepare options
    options = STRICT_OPTIONS
    if sourcemap
      options['exportSourcemap'] = true

    # Start timeout timer
    timeoutTimer = setTimeout(timeoutHandler, PARSER_TIMEOUT)

    # Parsing metric
    t = process.hrtime()

    drafter = new Drafter options
    drafter.make code, (err, result) ->
      # Parsing metric
      execTime = process.hrtime t
      execTime = execTime[0] + execTime[1]*10e-9 # ns to s
      emitter.emit 'metric', 'snowcrashParse', execTime

      # Stop the timeout timer
      clearTimeout(timeoutTimer)

      # Check if timed-out
      if parseHasFinished then return
      parseHasFinished = true

      if err
        err.errType = 'PARSE_ERROR'

        emitter.emit 'error', "PARSE_ERROR: '#{blueprintId}'" + JSON.stringify err

        err.line = countLines code, err.location[0]?.index
        return cb err

      # Transform API Blueprint AST into Blueprint strcuture
      apiBlueprintAdapter.transform result.ast, (result.warnings or []), (err, ast, warnings) ->
        return cb err, ast, warnings, result.sourcemap, result.ast

  else
    # Parse legacy Apiary Blueprint
    try
      # FIXME: Well, invent asynchronous parsing in parser
      apiaryAst = getAstSync code
    catch err
      return cb err
    cb null, apiaryBlueprintAdapter.transform apiaryAst

# ## Synchronous version that parses blueprint internally
# ** !!!Cannot be used with new blueprint parser!!! **
# Synchronous version might block event-loop for significant time
# Do not use unless absolutely needed
# Might throw error (propagates one from underlying implementation)
getAstSync = (code) ->
  apiaryBlueprintParser.parse code

module.exports = {
  parseApiaryBlueprintSync: getAstSync
  parse: getLocalAst
  newVersionRegExp: NEW_VERSION_REGEXP # layout control control (editor)
}
