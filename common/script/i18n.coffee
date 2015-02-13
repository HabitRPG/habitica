_ = require 'lodash'

module.exports = 
  strings: null, # Strings for one single language
  translations: {} # Strings for multiple languages {en: strings, de: strings, ...}
  t: (stringName) -> # Other parameters allowed are vars (Object) and locale (String)
    vars = arguments[1]

    if _.isString(arguments[1])
      vars = null
      locale = arguments[1]
    else if arguments[2]?
      vars = arguments[1]
      locale = arguments[2]

    locale = 'en' if (!locale? or (!module.exports.strings and !module.exports.translations[locale]))
    string = if (!module.exports.strings) then module.exports.translations[locale][stringName] else module.exports.strings[stringName]
    
    clonedVars = _.clone(vars) or {};
    clonedVars.locale = locale;

    if string
      try
        _.template(string, (clonedVars))
      catch e
        'Error processing string. Please report to http://github.com/HabitRPG/habitrpg.'
    else
      stringNotFound = if (!module.exports.strings) then module.exports.translations[locale].stringNotFound else module.exports.strings.stringNotFound
      try
        _.template(stringNotFound, {string: stringName})
      catch e
        'Error processing string. Please report to http://github.com/HabitRPG/habitrpg.'