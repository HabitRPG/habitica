i18n = require 'derby-i18n'

i18n.plurals.add 'he', (n) -> n
i18n.plurals.add 'bg', (n) -> n
i18n.plurals.add 'nl', (n) -> n

module.exports = i18n
