# Translations
i18n = require './i18n'
i18n.localize app,
  availableLocales: ['en', 'he', 'bg', 'nl']
  defaultLocale: 'en'
  urlScheme: false
  checkHeader: true


# ========== CONTROLLER FUNCTIONS ==========

ready (model) ->
  misc.fixCorruptUser(model) # https://github.com/lefnire/habitrpg/issues/634

  # used for things like remove website, chat, etc
  exports.removeAt = (e, el) ->
    if (confirmMessage = $(el).attr 'data-confirm')?
      return unless confirm(confirmMessage) is true
    e.at().remove()
    browser.resetDom(model) if $(el).attr('data-refresh')
