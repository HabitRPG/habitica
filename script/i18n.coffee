_ = require 'lodash'

module.exports = 
  strings: {}
  t: (stringName, vars) ->
    string = module.exports.strings[stringName]

    if string
      if vars then _.template(string, vars) else string
    else
      _.template(module.exports.strings.stringNotFound, {string: stringName})