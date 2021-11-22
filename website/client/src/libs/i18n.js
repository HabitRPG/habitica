// Vue plugin to globally expose a '$t' method that calls common/i18n.t.
// Can be anywhere inside vue as 'this.$t' or '$t' in templates.

import moment from 'moment';
import i18n from '@/../../common/script/i18n';

function loadLocale (i18nData) {
  // Load i18n strings
  i18n.strings = i18nData.strings;

  // Load Moment.js locale
  const { language } = i18nData;

  if (language && i18nData.momentLang && language.momentLangCode) {
    // Make moment available under `window` so that the locale can be set
    window.moment = moment;

    // Execute the script and set the locale
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = i18nData.momentLang;
    head.appendChild(script);
    moment.locale(language.momentLangCode);
  }
}

export default {
  install (Vue, { i18nData }) {
    if (i18nData) loadLocale(i18nData);

    Vue.prototype.$loadLocale = loadLocale;

    Vue.prototype.$t = function translateString (...args) {
      return i18n.t.apply(null, [...args]);
    };
  },
};
