#
# Legacy Blueprint parsing interface
#
apiaryBlueprintParser = require 'apiary-blueprint-parser'
protagonist = require 'protagonist'

DefaultFuryEmitter = require '../fury-emitter'
apiBlueprintAdapter = require './api-blueprint-adapter'
apiaryBlueprintAdapter = require './apiary-blueprint-adapter'

NEW_VERSION_REGEXP = new RegExp '^(((VERSION:( |\t)2)|(FORMAT:( |\t)(X-)?1A))\n)', 'i'

STRICT_OPTIONS =
  requireBlueprintName: true

# Default async parser timeout
# PARSER_TIMEOUT = parseInt process.env.PARSER_TIMEOUT, 10

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
getLocalAst = ({code, vanity, sourcemap, emitter}, cb) ->
  vanity ?= ''
  emitter ?= DefaultFuryEmitter()

  # alreadyDone = false

  if code.match(NEW_VERSION_REGEXP)

    # TODO: revisit timeout handling
    # parsingTimedOut = ->
    #   if alreadyDone then return
    #   alreadyDone = true
    #
    #   emitter.emit 'error', "PARSE_TIMEOUT : Parsing took too much time for vanity '#{vanity}'"
    #
    #   err = new Error('Parsing took too much time for vanity "#{vanity}"');
    #   err.errType = 'PARSE_TIMEOUT'
    #   err.message = ''.concat err.toString()
    #   err.description = ''.concat err.toString()
    #   err.location = [{index: 1, length: 0}]
    #   err.line = 1
    #   cb err
    #   return

    # Perphaps protagonist can handle the timeouts?
    # TODO: Seems this code does not work with current test
    # timer = null # setTimeout(parsingTimedOut, PARSER_TIMEOUT)

    t = process.hrtime()

    options = STRICT_OPTIONS

    if sourcemap
      options['exportSourcemap'] = true

    protagonist.parse code, options, (err, result) ->
      execTime = process.hrtime t
      execTime = execTime[0] + execTime[1]*10e-9 # ns to s

      emitter.emit 'metric', 'snowcrashParse', execTime

      #clearTimeout(timer)

      #if alreadyDone then return
      #alreadyDone = true
      if err
        err.errType = 'PARSE_ERROR'

        emitter.emit 'error', "PARSE_ERROR: '#{vanity}'" + JSON.stringify err

        err.line = countLines code, err.location[0]?.index
        return cb err

      apiBlueprintAdapter.transform result.ast, (result.warnings or []), (err, ast, warnings) ->
        return cb err, ast, warnings, result.sourcemap, result.ast

  else
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
