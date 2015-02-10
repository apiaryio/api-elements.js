# This is our Markdown parser implementation
# Uses Robotskirt, which is a node binding for a C markdown parser Sundown (also used by Github)
_         = require 'underscore'
#marked    = require 'marked'
rs        = require 'robotskirt'
sanitizer = require 'sanitizer'

renderer  = new rs.HtmlRenderer()

flags = [
  # ### Autolink
  #
  # Parse links even when they are not enclosed in
  # `<>` characters. Autolinks for the http, https and ftp
  # protocols will be automatically detected. Email addresses
  # are also handled, and http links without protocol, but
  # starting with `www.`
  rs.EXT_AUTOLINK

  # ### Fenced Code
  #
  # Parse fenced code blocks, PHP-Markdown
  # style. Blocks delimited with 3 or more `~` or backticks
  # will be considered as code, without the need to be
  # indented. An optional language name may be added at the
  # end of the opening fence for the code block.
  rs.EXT_FENCED_CODE

  # ### Lax Spacing
  #
  # HTML blocks do not require to be surrounded
  # by an empty line as in the Markdown standard.
  rs.EXT_LAX_HTML_BLOCKS

  # ### Tables
  #
  # Parse tables, PHP-Markdown style.
  rs.EXT_TABLES

  # ### No Intra Emphasis
  #
  # Do not parse emphasis inside of words.
  # Strings such as `foo_bar_baz` will not generate `<em>`
  # tags.
  rs.EXT_NO_INTRA_EMPHASIS

  # ### Strikethrough
  #
  # Parse strikethrough, PHP-Markdown style
  # Two `~` characters mark the start of a strikethrough,
  # e.g. `this is ~~good~~ bad`.
  rs.EXT_STRIKETHROUGH

  # ### Superscript
  #
  # Parse superscripts after the `^` character;
  # contiguous superscripts are nested together, and complex
  # values can be enclosed in parenthesis,
  # e.g. `this is the 2^(nd) time`.
  rs.EXT_SUPERSCRIPT
]

parser = new rs.Markdown(renderer, flags)
parserSync = new rs.Markdown(renderer, flags)

# By default, sanitizer removes src and href attributes
# if a url policy is not given.
uriPolicy = (value) -> value


parseMarkdown = (markdown, options={}) ->
  unless markdown
    return ''

  options.sanitize ?= true
  parsed = parserSync.render(markdown)

  if options.sanitize
    results = sanitizer.sanitize(parsed, uriPolicy)
  else
    results = parsed

  # Return <span> if the results are empty. This way other code
  # that renders knows this code has been parsed.
  return results unless results.trim() == ''
  return '<span></span>'


toHtml = (markdown, options={}, cb) ->
  # Allow for second arg to be the callback
  if _.isFunction options
    [cb, options] = [options, {}]

  unless markdown
    return cb null, ''
  cb null, parseMarkdown(markdown, options)


toHtmlSync = (markdown, options={}) ->
  parseMarkdown markdown, options

module.exports = {
  toHtml
  toHtmlSync
}
