_ = require 'lodash'

module.exports = 
  strings: {}, # Strings for one single language
  translations: {} # Strings for multiple languages {en: strings, de: strings, ...}
  t: (stringName) -> # Other parameters allowed are vars (Object) and locale (String)
    vars = arguments[1]

    if _.isString(arguments[1])
      vars = null
      locale = arguments[1]
    else if arguments[2]?
      vars = arguments[1]
      locale = arguments[2]

    string = if locale then module.exports.translations[locale][stringName] else module.exports.strings[stringName]

    if string
      if vars then _.template(string, vars) else string
    else
      stringNotFound = if locale then module.exports.translations[locale].stringNotFound else module.exports.strings.stringNotFound
      _.template(stringNotFound, {string: stringName})