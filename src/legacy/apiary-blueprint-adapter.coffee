BlueprintSDK = require './blueprint'
Markdown = require './markdown'

applyMarkdownHtml = (obj, targetHtmlProperty) ->
  obj[targetHtmlProperty] = Markdown.toHtmlSync(obj.description or '').trim()
  obj


# ## `apiaryAstToApplicationAst`
#
# _**Note:**_ `apiaryAst` is AST of the Old Blueprint Format.
#
# Go through the AST object and render
# Markdown descriptions.
apiaryAstToApplicationAst = (ast) ->
  plainJsObject = applyMarkdownHtml ast.toJSON(), 'htmlDescription'

  for section, sectionKey in plainJsObject.sections or [] when section.resources?.length
    for resource, resourceKey in section.resources
      section.resources[resourceKey] = applyMarkdownHtml resource, 'htmlDescription'
      section.resources[resourceKey].requests = [section.resources[resourceKey].request]

    plainJsObject.sections[sectionKey] = applyMarkdownHtml section, 'htmlDescription'

  plainJsObject.version = BlueprintSDK.Version

  return BlueprintSDK.Blueprint.fromJSON plainJsObject

module.exports = {
    transform: apiaryAstToApplicationAst
}
