# # Transform AST from Protagonist to legacy/application AST
# This is needed for two reasons
# 1) Protagonist's AST do not support .toJSON() yet
# 2) There are subtle differences in some parts of the tree
# Takes data and ensures it comes out as an object of objects. If array of
# sub-objects is given, takes out the 'key' property of the sub-object, places
# it as a key and uses the rest of the sub-object as a value. (Actual name of
# the key property can be changed by an argument.)
#
#   [
#     {name: 'a', color: 'blue'}
#     {name: 'b', color: 'red'}
#   ]
#
# is turned into
#
#   {
#     a: {color: 'blue'}
#     b: {color: 'red'}
#   }
ensureObjectOfObjects = (data, key = 'name') ->
  if not data
    {}
  else if Array.isArray data
    obj = {}
    for arrayItem in data
      values = {}
      for own k, v of arrayItem
        if k isnt key
          values[k] = v
      obj[arrayItem[key]] = values
    obj
  else
    data

module.exports = {
  ensureObjectOfObjects
}
