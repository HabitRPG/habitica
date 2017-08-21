// Vue plugin to globally expose a '$t' method that calls common/i18n.t.
// Can be anywhere inside vue as 'this.$t' or '$t' in templates.

import i18n from 'common/script/i18n';

i18n.strings = window.i18n.strings;

export default {
  install (Vue) {
    Vue.prototype.$t = function translateString () {
      return i18n.t.apply(null, arguments);
    };
  },
};