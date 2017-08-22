// Vue plugin to globally expose a '$t' method that calls common/i18n.t.
// Can be anywhere inside vue as 'this.$t' or '$t' in templates.

import i18n from 'common/script/i18n';
import moment from 'moment';

const i18nData = window.i18n;

if (i18nData) {
  // window.i18n is injected by the server
  i18n.strings = i18nData.strings;
  const language = i18nData.language;

  // Load Moment.js locale
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
  install (Vue) {
    Vue.prototype.$t = function translateString () {
      return i18n.t.apply(null, arguments);
    };
  },
};