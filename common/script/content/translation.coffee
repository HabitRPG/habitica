i18n = require '../i18n.coffee'
t = (string, vars) ->
  func = (lang) ->
    vars ?= {a: 'a'}
    i18n.t(string, vars, lang)
  func.i18nLangFunc = true #Trick to recognize this type of function
  func

module.exports = t
