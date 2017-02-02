// Plugin to expose globally a '$t' method that calls common/i18n.t.
// Can be used in templates.

import i18n from '../../common/script/i18n';
// Load all english translations
// TODO it's a workaround until proper translation loading works
const context = require.context('../../common/locales/en', true, /\.(json)$/);
const translations = {};

context.keys().forEach(filename => {
  Object.assign(translations, context(filename));
});

i18n.strings = translations;

export default {
  install (Vue) {
    Vue.prototype.$t = function translateString () {
      return i18n.t.apply(null, arguments);
    };
  },
};